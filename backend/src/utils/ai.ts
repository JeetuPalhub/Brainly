import crypto from 'crypto';
import { Types } from 'mongoose';
import { AICache } from '../models';

const getHFApiUrl = () => process.env.HF_API_URL || 'https://router.huggingface.co/hf-inference/models';
const getHFToken = () => process.env.HF_API_TOKEN;
const getHFTagModel = () => process.env.HF_TAG_MODEL || 'facebook/bart-large-mnli';
const getHFSummaryModel = () => process.env.HF_SUMMARY_MODEL || 'facebook/bart-large-cnn';
const getHFEmbeddingModel = () => process.env.HF_EMBEDDING_MODEL || 'BAAI/bge-small-en-v1.5';
const getHFTimeoutMs = () => Number(process.env.HF_TIMEOUT_MS || 20000);
const getAICacheTtlHours = () => Number(process.env.AI_CACHE_TTL_HOURS || 24 * 14);

const COMMON_TAG_LABELS = [
  'productivity',
  'learning',
  'programming',
  'frontend',
  'backend',
  'react',
  'nodejs',
  'mongodb',
  'database',
  'design',
  'startup',
  'business',
  'career',
  'ai',
  'machine learning',
  'devops',
  'security',
  'finance',
  'health',
  'news'
];

const STOPWORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'about', 'into', 'there', 'their',
  'what', 'when', 'were', 'which', 'while', 'where', 'would', 'could', 'should', 'than', 'been', 'being',
  'http', 'https', 'www', 'com', 'org', 'net', 'you', 'for', 'are', 'but', 'not', 'can', 'its', 'our', 'out'
]);

export type AISource = 'huggingface' | 'fallback';

export type SummaryResult = {
  summary: string;
  source: AISource;
};

export type TagsResult = {
  tags: string[];
  source: AISource;
};

export type EmbeddingResult = {
  embedding: number[];
  source: AISource;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

const buildHash = (input: string) => crypto.createHash('sha256').update(input).digest('hex');

const parseEmbedding = (value: unknown): number[] => {
  if (Array.isArray(value) && typeof value[0] === 'number') {
    return value as number[];
  }

  if (Array.isArray(value) && Array.isArray(value[0])) {
    return (value[0] as unknown[]).filter((n) => typeof n === 'number') as number[];
  }

  return [];
};

const deterministicFallbackEmbedding = (text: string, dimension = 128) => {
  const vector = new Array<number>(dimension).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    const hash = buildHash(token);
    for (let i = 0; i < 4; i += 1) {
      const slice = hash.slice(i * 8, i * 8 + 8);
      const bucket = parseInt(slice, 16) % dimension;
      const sign = parseInt(hash.slice(32 + i, 33 + i), 16) % 2 === 0 ? 1 : -1;
      vector[bucket] += sign;
    }
  }

  const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0));
  if (norm === 0) {
    return vector;
  }

  return vector.map((value) => value / norm);
};

const fallbackTags = (text: string, maxTags = 5) => {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word]) => word);
};

const fallbackSummary = (text: string) => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return 'No summary available.';
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  const selected = sentences.slice(0, 2).join(' ');
  return selected.length <= 280 ? selected : `${selected.slice(0, 277)}...`;
};

const getExpiresAt = () => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + getAICacheTtlHours());
  return expiresAt;
};

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getHFTimeoutMs());

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const callHuggingFace = async (model: string, payload: unknown) => {
  const token = getHFToken();
  if (!token) {
    throw new Error('HF token is missing');
  }

  const url = `${getHFApiUrl()}/${model}`;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      throw new Error('HF rate limit');
    }

    if (response.status === 503 && attempt < 2) {
      const body = await response.json().catch(() => ({}));
      const waitMs = Number((body as { estimated_time?: number })?.estimated_time || 2) * 1000;
      await wait(waitMs);
      continue;
    }

    if (!response.ok) {
      throw new Error(`HF request failed (${response.status})`);
    }

    return response.json();
  }

  throw new Error('HF request failed');
};

const getCachedValue = async <T>(userId: string, task: string, modelName: string, input: string): Promise<T | null> => {
  const inputHash = buildHash(input);
  const cache = await AICache.findOne({
    userId: new Types.ObjectId(userId),
    task,
    modelName,
    inputHash,
    expiresAt: { $gt: new Date() }
  });

  if (!cache) {
    return null;
  }

  return cache.response as T;
};

const setCachedValue = async (
  userId: string,
  task: string,
  modelName: string,
  input: string,
  response: unknown,
  source: AISource,
  status: 'ok' | 'error' = 'ok'
) => {
  const inputHash = buildHash(input);
  const inputPreview = input.slice(0, 200);
  await AICache.findOneAndUpdate(
    {
      userId: new Types.ObjectId(userId),
      task,
      modelName,
      inputHash
    },
    {
      userId: new Types.ObjectId(userId),
      task,
      modelName,
      inputHash,
      inputPreview,
      response,
      source,
      status,
      expiresAt: getExpiresAt()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const cosineSimilarity = (a: number[], b: number[]) => {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const summarizeText = async (userId: string, text: string): Promise<SummaryResult> => {
  const normalized = normalizeText(text);
  const task = 'summarization';
  const modelName = getHFSummaryModel();
  const cached = await getCachedValue<SummaryResult>(userId, task, modelName, normalized);
  if (cached) {
    return cached;
  }

  try {
    const output = await callHuggingFace(modelName, {
      inputs: normalized,
      parameters: {
        max_length: 120,
        min_length: 30
      }
    });

    const summary = Array.isArray(output)
      ? String((output[0] as { summary_text?: string })?.summary_text || '')
      : '';

    const result: SummaryResult = {
      summary: summary || fallbackSummary(normalized),
      source: 'huggingface'
    };

    await setCachedValue(userId, task, modelName, normalized, result, result.source);
    return result;
  } catch (_error) {
    const result: SummaryResult = {
      summary: fallbackSummary(normalized),
      source: 'fallback'
    };
    await setCachedValue(userId, task, modelName, normalized, result, result.source, 'error');
    return result;
  }
};

export const generateAnswer = async (
  userId: string,
  question: string,
  context: string
): Promise<{ answer: string; source: AISource }> => {
  const task = 'generation';
  // Use a strong instruction-tuned model. Mistral-7B-Instruct is a great choice.
  // Fallback to a smaller model if needed, but for "chat", quality matters.
  const modelName = process.env.HF_GENERATION_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';

  // Create a cache key based on question + context hash to reuse answers if context serves same query
  const inputHash = `${question}::${buildHash(context)}`;

  const cached = await getCachedValue<{ answer: string; source: AISource }>(userId, task, modelName, inputHash);
  if (cached) {
    return cached;
  }

  // Construct a prompt that enforces using ONLY the context
  const prompt = `<s>[INST] You are a helpful personal assistant for a "Second Brain" application. 
Answer the user's question primarily based on the provided CONTEXT from their notes.
If the context doesn't contain the answer, say "I couldn't find that in your notes, but..." and then provide a general answer if you know it, or just say you don't know.
Keep the answer concise and friendly.

CONTEXT:
${context}

QUESTION:
${question} [/INST]`;

  try {
    const output = await callHuggingFace(modelName, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false
      }
    });

    // HF Text Generation API usually returns [{ generated_text: "..." }]
    const answer = Array.isArray(output)
      ? (output[0] as { generated_text?: string })?.generated_text || ''
      : (output as { generated_text?: string })?.generated_text || '';

    const cleanAnswer = answer.trim() || 'I could not generate an answer at this time.';

    const result = {
      answer: cleanAnswer,
      source: 'huggingface' as AISource
    };

    await setCachedValue(userId, task, modelName, inputHash, result, result.source);
    return result;
  } catch (error) {
    console.error('AI Generation error:', error);
    return {
      answer: "I'm having trouble connecting to my brain right now. Please try again later.",
      source: 'fallback'
    };
  }
};

export const suggestTags = async (userId: string, text: string, existingTags: string[] = []): Promise<TagsResult> => {
  const normalized = normalizeText(text);
  const task = 'tagging';
  const modelName = getHFTagModel();
  const labels = Array.from(new Set([...COMMON_TAG_LABELS, ...existingTags.filter(Boolean).map((tag) => tag.toLowerCase())])).slice(0, 30);
  const cacheInput = `${normalized}::${labels.join(',')}`;

  const cached = await getCachedValue<TagsResult>(userId, task, modelName, cacheInput);
  if (cached) {
    return cached;
  }

  try {
    const output = await callHuggingFace(modelName, {
      inputs: normalized,
      parameters: {
        candidate_labels: labels,
        multi_label: true
      }
    });

    const predictedLabels = Array.isArray((output as { labels?: string[] })?.labels)
      ? (output as { labels: string[] }).labels
      : [];
    const scores = Array.isArray((output as { scores?: number[] })?.scores)
      ? (output as { scores: number[] }).scores
      : [];

    const tags = predictedLabels
      .map((label, index) => ({ label: label.toLowerCase(), score: scores[index] || 0 }))
      .filter((item) => item.score >= 0.25)
      .slice(0, 5)
      .map((item) => item.label);

    const result: TagsResult = {
      tags: tags.length ? tags : fallbackTags(normalized),
      source: 'huggingface'
    };

    await setCachedValue(userId, task, modelName, cacheInput, result, result.source);
    return result;
  } catch (_error) {
    const result: TagsResult = {
      tags: fallbackTags(normalized),
      source: 'fallback'
    };
    await setCachedValue(userId, task, modelName, cacheInput, result, result.source, 'error');
    return result;
  }
};

export const getEmbedding = async (userId: string, text: string): Promise<EmbeddingResult> => {
  const normalized = normalizeText(text);
  const task = 'embedding';
  const modelName = getHFEmbeddingModel();
  const cached = await getCachedValue<EmbeddingResult>(userId, task, modelName, normalized);
  if (cached) {
    return cached;
  }

  try {
    const output = await callHuggingFace(modelName, {
      inputs: normalized,
      options: {
        wait_for_model: true
      }
    });

    const embedding = parseEmbedding(output);
    if (!embedding.length) {
      throw new Error('Invalid embedding output');
    }

    const result: EmbeddingResult = {
      embedding,
      source: 'huggingface'
    };

    await setCachedValue(userId, task, modelName, normalized, result, result.source);
    return result;
  } catch (_error) {
    const result: EmbeddingResult = {
      embedding: deterministicFallbackEmbedding(normalized),
      source: 'fallback'
    };
    await setCachedValue(userId, task, modelName, normalized, result, result.source, 'error');
    return result;
  }
};

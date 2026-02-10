import express, { Response } from 'express';
import { Types } from 'mongoose';
import { Content, Tag, Collection } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { fetchContentMetadata } from '../utils/metadata';
import { cosineSimilarity, getEmbedding, suggestTags, summarizeText } from '../utils/ai';

const router = express.Router();

const validTypes = ['document', 'tweet', 'youtube', 'link'];
const DUPLICATE_THRESHOLD = Number(process.env.AI_DUPLICATE_THRESHOLD || 0.88);

router.use(authMiddleware);

const requireUserId = (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return req.userId;
};

const normalizeType = (value: string | undefined, link: string) => {
  if (value && validTypes.includes(value)) {
    return value as 'document' | 'tweet' | 'youtube' | 'link';
  }
  const normalizedLink = link.toLowerCase();
  if (normalizedLink.includes('youtube.com') || normalizedLink.includes('youtu.be')) {
    return 'youtube';
  }
  if (normalizedLink.includes('twitter.com') || normalizedLink.includes('x.com')) {
    return 'tweet';
  }
  return 'link';
};

const buildContentText = (params: {
  title?: string;
  description?: string;
  link?: string;
  tags?: string[];
  type?: string;
}) => {
  const chunks = [
    params.title,
    params.description,
    params.link,
    params.type,
    ...(params.tags || [])
  ]
    .map((chunk) => (chunk || '').trim())
    .filter(Boolean);

  return chunks.join(' | ');
};

const ensureEmbedding = async (userId: string, content: any) => {
  if (Array.isArray(content.embedding) && content.embedding.length > 0) {
    return content.embedding as number[];
  }

  const text = buildContentText({
    title: content.title,
    description: content.aiSummary || content.metadata?.description,
    link: content.link,
    type: content.type,
    tags: (content.tags || []).map((tag: any) => tag?.title).filter(Boolean)
  });

  const embeddingResult = await getEmbedding(userId, text);
  await Content.updateOne(
    { _id: content._id, userId },
    {
      $set: {
        embedding: embeddingResult.embedding,
        'aiSources.embedding': embeddingResult.source
      }
    }
  );

  return embeddingResult.embedding;
};

router.get('/preview', async (req: AuthRequest, res: Response) => {
  try {
    const { url, type } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'url query parameter is required' });
    }

    const metadata = await fetchContentMetadata(
      url,
      typeof type === 'string' ? (type as 'document' | 'tweet' | 'youtube' | 'link') : undefined
    );

    return res.status(200).json({ metadata });
  } catch (error) {
    console.error('Preview metadata error:', error);
    return res.status(500).json({ message: 'Unable to fetch preview metadata' });
  }
});

router.post('/ai/suggest', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    const { title, description, link, type, text } = req.body as {
      title?: string;
      description?: string;
      link?: string;
      type?: string;
      text?: string;
    };

    const input = (text || buildContentText({ title, description, link, type })).trim();
    if (!input) {
      return res.status(400).json({ message: 'Provide title/description/link/text to analyze' });
    }

    const knownTags = await Tag.find({}).select('title').lean();
    const knownTagTitles = knownTags.map((tag) => tag.title).filter(Boolean);

    const [tagsResult, summaryResult, embeddingResult] = await Promise.all([
      suggestTags(userId, input, knownTagTitles),
      summarizeText(userId, input),
      getEmbedding(userId, input)
    ]);

    const existing = await Content.find({ userId })
      .populate('tags', 'title')
      .select('title link type aiSummary metadata tags embedding');

    const duplicateCandidates: Array<{
      contentId: string;
      title: string;
      link: string;
      score: number;
    }> = [];

    for (const item of existing) {
      const embedding = await ensureEmbedding(userId, item);
      const score = cosineSimilarity(embeddingResult.embedding, embedding);
      if (score >= DUPLICATE_THRESHOLD) {
        duplicateCandidates.push({
          contentId: item._id.toString(),
          title: item.title,
          link: item.link,
          score: Number(score.toFixed(4))
        });
      }
    }

    duplicateCandidates.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      summary: summaryResult.summary,
      tags: tagsResult.tags,
      sources: {
        summary: summaryResult.source,
        tags: tagsResult.source,
        embedding: embeddingResult.source
      },
      duplicateCandidates: duplicateCandidates.slice(0, 5),
      rateLimitedFallback: [summaryResult, tagsResult, embeddingResult].some((result) => result.source === 'fallback')
    });
  } catch (error) {
    console.error('AI suggest error:', error);
    return res.status(500).json({ message: 'Unable to generate AI suggestions' });
  }
});

router.get('/ai/search', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    const query = String(req.query.query || '').trim();
    const limit = Math.min(Number(req.query.limit || 20), 50);

    if (!query) {
      return res.status(400).json({ message: 'query is required' });
    }

    const queryEmbeddingResult = await getEmbedding(userId, query);

    const content = await Content.find({ userId })
      .populate('tags', 'title')
      .populate('collectionId', 'name')
      .sort({ createdAt: -1 });

    const scored: Array<{ content: any; score: number }> = [];

    for (const item of content) {
      const embedding = await ensureEmbedding(userId, item);
      const score = cosineSimilarity(queryEmbeddingResult.embedding, embedding);
      scored.push({ content: item, score });
    }

    scored.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      query,
      source: queryEmbeddingResult.source,
      results: scored.slice(0, limit).map((entry) => ({
        content: entry.content,
        score: Number(entry.score.toFixed(4))
      }))
    });
  } catch (error) {
    console.error('AI semantic search error:', error);
    return res.status(500).json({ message: 'Unable to run semantic search' });
  }
});

router.post('/import', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    const { items } = req.body as {
      items?: Array<{
        type?: string;
        link?: string;
        title?: string;
        tags?: string[] | string;
        collectionId?: string;
        collectionName?: string;
      }>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    if (items.length > 500) {
      return res.status(400).json({ message: 'You can import up to 500 items at once' });
    }

    const tagCache = new Map<string, Types.ObjectId>();
    const collectionCache = new Map<string, Types.ObjectId>();

    const getOrCreateTag = async (title: string) => {
      const normalized = title.trim().toLowerCase();
      if (!normalized) {
        return undefined;
      }
      const cached = tagCache.get(normalized);
      if (cached) {
        return cached;
      }

      let tag = await Tag.findOne({ title: title.trim() });
      if (!tag) {
        tag = new Tag({ title: title.trim() });
        await tag.save();
      }
      const id = tag._id as Types.ObjectId;
      tagCache.set(normalized, id);
      return id;
    };

    const getOrCreateCollection = async (collectionName?: string, collectionId?: string) => {
      if (collectionId) {
        const collection = await Collection.findOne({ _id: collectionId, userId });
        return collection ? (collection._id as Types.ObjectId) : undefined;
      }

      if (!collectionName?.trim()) {
        return undefined;
      }

      const normalized = collectionName.trim().toLowerCase();
      const cached = collectionCache.get(normalized);
      if (cached) {
        return cached;
      }

      let collection = await Collection.findOne({ userId, name: collectionName.trim() });
      if (!collection) {
        collection = new Collection({ userId, name: collectionName.trim() });
        await collection.save();
      }

      const id = collection._id as Types.ObjectId;
      collectionCache.set(normalized, id);
      return id;
    };

    const imported: string[] = [];
    const failed: Array<{ index: number; reason: string }> = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      try {
        const link = item.link?.trim();
        if (!link) {
          failed.push({ index, reason: 'Missing link' });
          continue;
        }

        const type = normalizeType(item.type?.trim(), link);
        const metadata = await fetchContentMetadata(link, type).catch(() => undefined);

        const title = item.title?.trim() || metadata?.title || metadata?.domain || link;
        const tagsInput = Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
            ? item.tags.split(/[|,;]+/)
            : [];

        const tagIds: Types.ObjectId[] = [];
        for (const tag of tagsInput) {
          const tagId = await getOrCreateTag(String(tag));
          if (tagId) {
            tagIds.push(tagId);
          }
        }

        const collectionRef = await getOrCreateCollection(item.collectionName, item.collectionId);

        const content = new Content({
          type,
          link,
          title,
          tags: tagIds,
          collectionId: collectionRef,
          metadata,
          userId
        });

        await content.save();
        imported.push(content._id.toString());
      } catch (_error) {
        failed.push({ index, reason: 'Unable to import this item' });
      }
    }

    return res.status(200).json({
      message: 'Import completed',
      importedCount: imported.length,
      failedCount: failed.length,
      failed
    });
  } catch (error) {
    console.error('Import content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    const { type, link, title, tags, collectionId } = req.body as {
      type: string;
      link: string;
      title?: string;
      tags?: string[];
      collectionId?: string;
    };

    if (!type || !link) {
      return res.status(411).json({ message: 'Type and link are required' });
    }

    if (!validTypes.includes(type)) {
      return res.status(411).json({ message: 'Invalid content type' });
    }

    let collectionRef: Types.ObjectId | undefined;
    if (collectionId) {
      const collection = await Collection.findOne({ _id: collectionId, userId });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      collectionRef = collection._id as Types.ObjectId;
    }

    const metadata = await fetchContentMetadata(link, type as any).catch(() => undefined);
    const resolvedTitle = typeof title === 'string' && title.trim() ? title.trim() : metadata?.title;
    if (!resolvedTitle) {
      return res.status(411).json({ message: 'Title is required (or provide a URL with detectable metadata)' });
    }

    const inputTags = (Array.isArray(tags) ? tags : []).map((tag) => String(tag).trim()).filter(Boolean);
    const textForAI = buildContentText({
      title: resolvedTitle,
      description: metadata?.description,
      link,
      tags: inputTags,
      type
    });

    const knownTags = await Tag.find({}).select('title').lean();
    const knownTagTitles = knownTags.map((tag) => tag.title).filter(Boolean);

    const [aiTags, aiSummary, aiEmbedding] = await Promise.all([
      suggestTags(userId, textForAI, [...knownTagTitles, ...inputTags]),
      summarizeText(userId, textForAI),
      getEmbedding(userId, textForAI)
    ]);

    const mergedTags = Array.from(new Set([...inputTags, ...aiTags.tags]));
    const tagIds: Types.ObjectId[] = [];

    for (const tagTitle of mergedTags) {
      let tag = await Tag.findOne({ title: tagTitle });
      if (!tag) {
        tag = new Tag({ title: tagTitle });
        await tag.save();
      }
      tagIds.push(tag._id as Types.ObjectId);
    }

    const existingContent = await Content.find({ userId })
      .select('title link embedding')
      .sort({ createdAt: -1 })
      .limit(200);

    const duplicateCandidates: Array<{ contentId: string; title: string; link: string; score: number }> = [];
    for (const existing of existingContent) {
      let existingEmbedding = existing.embedding as number[] | undefined;
      if (!existingEmbedding?.length) {
        const computed = await getEmbedding(userId, `${existing.title} | ${existing.link}`);
        existingEmbedding = computed.embedding;
        await Content.updateOne(
          { _id: existing._id, userId },
          {
            $set: {
              embedding: existingEmbedding,
              'aiSources.embedding': computed.source
            }
          }
        );
      }

      const score = cosineSimilarity(aiEmbedding.embedding, existingEmbedding);
      if (score >= DUPLICATE_THRESHOLD) {
        duplicateCandidates.push({
          contentId: existing._id.toString(),
          title: existing.title,
          link: existing.link,
          score: Number(score.toFixed(4))
        });
      }
    }

    duplicateCandidates.sort((a, b) => b.score - a.score);

    const newContent = new Content({
      type,
      link,
      title: resolvedTitle,
      aiSummary: aiSummary.summary,
      aiSources: {
        summary: aiSummary.source,
        tags: aiTags.source,
        embedding: aiEmbedding.source
      },
      embedding: aiEmbedding.embedding,
      tags: tagIds,
      collectionId: collectionRef,
      metadata,
      userId
    });

    await newContent.save();

    return res.status(200).json({
      message: 'Content added successfully',
      content: newContent,
      ai: {
        tags: mergedTags,
        summary: aiSummary.summary,
        sources: newContent.aiSources,
        duplicateCandidates: duplicateCandidates.slice(0, 3),
        rateLimitedFallback: [aiTags.source, aiSummary.source, aiEmbedding.source].includes('fallback')
      }
    });
  } catch (error) {
    console.error('Add content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    const content = await Content.find({ userId })
      .populate('tags', 'title')
      .populate('collectionId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }

    if (!contentId) {
      return res.status(411).json({ message: 'Content ID is required' });
    }

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this content' });
    }

    await Content.findByIdAndDelete(contentId);

    return res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

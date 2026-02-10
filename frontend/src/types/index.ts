export interface User {
  username: string;
  token: string;
}

export interface Content {
  _id: string;
  type: 'document' | 'tweet' | 'youtube' | 'link';
  link: string;
  title: string;
  aiSummary?: string;
  aiSources?: {
    summary?: 'huggingface' | 'fallback';
    tags?: 'huggingface' | 'fallback';
    embedding?: 'huggingface' | 'fallback';
  };
  tags: Tag[];
  collectionId?: Collection | null;
  metadata?: ContentMetadata | null;
  userId: string;
  createdAt: string;
}

export interface DuplicateCandidate {
  contentId: string;
  title: string;
  link: string;
  score: number;
}

export interface AISuggestions {
  summary: string;
  tags: string[];
  sources: {
    summary?: 'huggingface' | 'fallback';
    tags?: 'huggingface' | 'fallback';
    embedding?: 'huggingface' | 'fallback';
  };
  duplicateCandidates: DuplicateCandidate[];
  rateLimitedFallback: boolean;
}

export interface Tag {
  _id: string;
  title: string;
}

export interface Collection {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface ContentMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  domain?: string;
}

export interface ShareResponse {
  link: string;
}

export interface SharedBrain {
  username: string;
  content: Content[];
}

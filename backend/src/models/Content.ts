import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContent extends Document {
  link: string;
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  aiSummary?: string;
  aiSources?: {
    summary?: 'huggingface' | 'fallback';
    tags?: 'huggingface' | 'fallback';
    embedding?: 'huggingface' | 'fallback';
  };
  embedding?: number[];
  tags: Types.ObjectId[];
  collectionId?: Types.ObjectId;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    siteName?: string;
    domain?: string;
  };
  userId: Types.ObjectId;
  createdAt: Date;
}

const contentTypes = ['document', 'tweet', 'youtube', 'link'];

const contentSchema = new Schema<IContent>({
  link: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: contentTypes,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  aiSummary: {
    type: String
  },
  aiSources: {
    summary: {
      type: String,
      enum: ['huggingface', 'fallback']
    },
    tags: {
      type: String,
      enum: ['huggingface', 'fallback']
    },
    embedding: {
      type: String,
      enum: ['huggingface', 'fallback']
    }
  },
  embedding: [{
    type: Number
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  collectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Collection'
  },
  metadata: {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    favicon: { type: String },
    siteName: { type: String },
    domain: { type: String }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Content = mongoose.model<IContent>('Content', contentSchema);

export default Content;

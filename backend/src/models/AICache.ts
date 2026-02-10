import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAICache extends Document {
  userId: Types.ObjectId;
  task: string;
  modelName: string;
  inputHash: string;
  inputPreview: string;
  response: unknown;
  source: 'huggingface' | 'fallback';
  status: 'ok' | 'error';
  createdAt: Date;
  expiresAt: Date;
}

const aiCacheSchema = new Schema<IAICache>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  task: {
    type: String,
    required: true,
    index: true
  },
  modelName: {
    type: String,
    required: true
  },
  inputHash: {
    type: String,
    required: true
  },
  inputPreview: {
    type: String,
    required: true
  },
  response: {
    type: Schema.Types.Mixed,
    required: true
  },
  source: {
    type: String,
    enum: ['huggingface', 'fallback'],
    required: true
  },
  status: {
    type: String,
    enum: ['ok', 'error'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
});

aiCacheSchema.index({ userId: 1, task: 1, modelName: 1, inputHash: 1 }, { unique: true });
aiCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AICache = mongoose.model<IAICache>('AICache', aiCacheSchema);

export default AICache;

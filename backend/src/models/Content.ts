import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContent extends Document {
  link: string;
  type: 'document' | 'tweet' | 'youtube' | 'link';
  title: string;
  tags: Types.ObjectId[];
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
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
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

const Content = mongoose.model<IContent>('Content', contentSchema);

export default Content;
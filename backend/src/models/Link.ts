import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  hash: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const linkSchema = new Schema<ILink>({
  hash: {
    type: String,
    required: true,
    unique: true
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

const Link = mongoose.model<ILink>('Link', linkSchema);

export default Link;
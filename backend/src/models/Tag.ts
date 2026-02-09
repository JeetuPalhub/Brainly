import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  title: string;
}

const tagSchema = new Schema<ITag>({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

const Tag = mongoose.model<ITag>('Tag', tagSchema);

export default Tag;
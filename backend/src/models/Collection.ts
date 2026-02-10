import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  userId: Types.ObjectId;
  createdAt: Date;
}

const collectionSchema = new Schema<ICollection>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
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

collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

const Collection = mongoose.model<ICollection>('Collection', collectionSchema);

export default Collection;

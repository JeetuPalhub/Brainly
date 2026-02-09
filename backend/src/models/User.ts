import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 10,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100 // Will store hashed password
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface UserType {
  _id: mongoose.Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePic: Buffer;
  maps: mongoose.Schema.Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: Buffer, default: Buffer.alloc(0) },
    maps: [{ type: Schema.Types.ObjectId, required: true, ref: 'Map' }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

const userModel = mongoose.model('User', userSchema);
export type { UserType };

export default userModel;

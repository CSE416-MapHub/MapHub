import { Schema, model } from 'mongoose';
import { UserType } from './user-model';

interface PopulatedComment {
  user: UserType;
  content: string;
  replies: PopulatedComment[];
  likes: Schema.Types.ObjectId;
}

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: { type: String, required: true },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Comment = model('Comment', commentSchema);

export type { PopulatedComment };
export default Comment;

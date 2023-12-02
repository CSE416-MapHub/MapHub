import { Schema, model } from 'mongoose';

interface IComment {
  user: Schema.Types.ObjectId;
  content: string;
  replies: [Schema.Types.ObjectId];
  likes: [Schema.Types.ObjectId];
}

const commentSchema = new Schema<IComment>(
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
        required: true,
        ref: 'Comment',
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

const Comment = model<IComment>('Comment', commentSchema);

export default Comment;

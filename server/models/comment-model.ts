import { Schema, model } from 'mongoose';

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

export default Comment;

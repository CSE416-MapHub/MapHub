import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    map: { type: mongoose.Schema.Types.ObjectId, ref: 'Map', required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Post = mongoose.model('Post', PostSchema);

export default Post;

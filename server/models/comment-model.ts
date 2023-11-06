import mongoose from 'mongoose';

const Schema = mongoose.Schema

const commentSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: { type: [{
            title: String,
            artist: String,
            youTubeId: String
        }], required: true },
        comments: { type: [{
            user: String,
            comment: String
        }], required: true},
        likes: { type: [{
            user: String
        }], required: true },
        dislikes: { type: [{
            user: String
        }], required: true },
        publishDate: { type: Date },
        listens: { type: Number, required: true }
    },
    { timestamps: true },
)

module.exports = mongoose.model('Comment', commentSchema)

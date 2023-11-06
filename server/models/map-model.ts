import mongoose from 'mongoose';

const Schema = mongoose.Schema

const mapSchema = new Schema(
    {
    },
    { timestamps: true },
)

module.exports = mongoose.model('Map', mapSchema)

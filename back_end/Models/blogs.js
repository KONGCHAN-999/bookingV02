const mongoose = require('mongoose');

const blogs = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Note: lowercase 't' in timestamps

module.exports = mongoose.model('Blog', blogs);
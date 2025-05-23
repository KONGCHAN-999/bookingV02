const mongoose = require('mongoose');

const blogs = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    files: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number
    }],
}, { timestamps: true }); // Note: lowercase 't' in timestamps

module.exports = mongoose.model('Blog', blogs);
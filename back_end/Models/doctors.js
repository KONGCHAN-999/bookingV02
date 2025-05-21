const mongoose = require('mongoose');

const doctors = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    specialty: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    education: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    certifications: {
        type: [String],
        default: []
    },
    file: String,
}, { timestamps: true }); // Note: lowercase 't' in timestamps

module.exports = mongoose.model('Doctor', doctors);
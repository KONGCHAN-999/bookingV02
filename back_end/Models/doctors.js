const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    specialty: {
        type: String,
        trim: true
    },
    contact: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    education: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    certifications: {
        type: String, // FIXED: Changed from [String] to String to match frontend
        trim: true
    },
    file: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
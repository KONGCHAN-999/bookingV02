const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./Config/db');
const { readdirSync } = require('fs');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Fixed: Use express.json instead of bodyParse
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Added for form data

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
readdirSync('./Routes')
    .map((r) => app.use('/api', require('./Routes/' + r)));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
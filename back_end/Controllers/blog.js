const Blog = require('../Models/blogs'); // Updated path to Blog model
const fs = require('fs');
const path = require('path');

// Get all blogs
exports.list = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// Get single blog
exports.read = async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (err) {
        console.error('Error fetching blog:', err);

        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// Helper function to delete files
const deleteFiles = (files) => {
    if (Array.isArray(files)) {
        files.forEach(file => {
            const filePath = path.join('uploads', file);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });
    } else if (files) {
        const filePath = path.join('uploads', files);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};

// Create new blog with multiple images
exports.create = async (req, res) => {
    try {
        const data = { ...req.body };

        // Handle multiple files upload
        if (req.files && req.files.length > 0) {
            data.files = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        // Handle single file upload (backward compatibility)
        if (req.file) {
            data.file = req.file.filename;
        }

        // Create new blog
        const newBlog = new Blog(data);
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);

    } catch (err) {
        console.error('Error creating blog:', err);

        // Delete uploaded files if blog creation fails
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map(file => file.filename);
            deleteFiles(filenames);
        }
        if (req.file) {
            deleteFiles(req.file.filename);
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: err.message
            });
        }

        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// Create blog with mixed upload (single + multiple)
exports.createMixed = async (req, res) => {
    try {
        const data = { ...req.body };

        // Handle single image
        if (req.files && req.files.image && req.files.image[0]) {
            data.file = req.files.image[0].filename;
        }

        // Handle multiple images
        if (req.files && req.files.images && req.files.images.length > 0) {
            data.files = req.files.images.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        const newBlog = new Blog(data);
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);

    } catch (err) {
        console.error('Error creating blog:', err);

        // Clean up uploaded files
        if (req.files) {
            if (req.files.image) {
                deleteFiles(req.files.image.map(f => f.filename));
            }
            if (req.files.images) {
                deleteFiles(req.files.images.map(f => f.filename));
            }
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: err.message
            });
        }

        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// Update blog with multiple images
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Update request for ID:', id);
        console.log('Update request body:', req.body);
        console.log('Update request files:', req.files);

        // Find existing blog
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const updateData = { ...req.body };
        const oldFiles = [];

        // Handle multiple files update
        if (req.files && req.files.length > 0) {
            // Collect old filenames for deletion
            if (existingBlog.files && existingBlog.files.length > 0) {
                oldFiles.push(...existingBlog.files.map(f => f.filename));
            }

            updateData.files = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        // Handle single file update (backward compatibility)
        if (req.file) {
            if (existingBlog.file) {
                oldFiles.push(existingBlog.file);
            }
            updateData.file = req.file.filename;
        }

        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Delete old files after successful update
        if (oldFiles.length > 0) {
            deleteFiles(oldFiles);
        }

        console.log('Blog updated successfully:', updatedBlog);
        res.json(updatedBlog);

    } catch (err) {
        console.error('Error updating blog:', err);

        // Delete uploaded files if update fails
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map(file => file.filename);
            deleteFiles(filenames);
        }
        if (req.file) {
            deleteFiles(req.file.filename);
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: err.message
            });
        }

        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// Delete blog and associated files
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Collect all files to delete
        const filesToDelete = [];
        if (blog.files && blog.files.length > 0) {
            filesToDelete.push(...blog.files.map(f => f.filename));
        }
        if (blog.file) {
            filesToDelete.push(blog.file);
        }

        // Delete blog from database
        await Blog.findByIdAndDelete(id);

        // Delete associated files
        if (filesToDelete.length > 0) {
            deleteFiles(filesToDelete);
        }

        res.json({ message: 'Blog and associated files deleted successfully' });

    } catch (err) {
        console.error('Error deleting blog:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};
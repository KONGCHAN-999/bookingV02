const express = require('express');
const router = express.Router();

const {
    read,
    list,
    create,
    createMixed,
    update,
    remove
} = require('../Controllers/blog');

const { upload, uploadMultiple, uploadMixed } = require('../middleware/upload');

// Read routes
router.get('/blog', list);
router.get('/blog/:id', read);

// Create routes
router.post('/blog', upload, create); // Single image (backward compatibility)
router.post('/blog/multiple', uploadMultiple, create); // Multiple images
router.post('/blog/mixed', uploadMixed, createMixed); // Single + multiple images

// Update routes
router.put('/blog/:id', upload, update); // Single image update
router.put('/blog/:id/multiple', uploadMultiple, update); // Multiple images update
router.put('/blog/:id/mixed', uploadMixed, update); // Mixed update

// Delete route
router.delete('/blog/:id', remove);

module.exports = router;
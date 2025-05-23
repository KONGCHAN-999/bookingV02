const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with proper extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'blog-' + uniqueSuffix + extension);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Single image upload (keep for backward compatibility)
exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
    },
    fileFilter: fileFilter
}).single('image');

// Multiple images upload (up to 10 images)
exports.uploadMultiple = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
}).array('images', 10); // Field name 'images' with max 10 files

// Mixed upload (single image + multiple images)
exports.uploadMixed = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    },
    fileFilter: fileFilter
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);
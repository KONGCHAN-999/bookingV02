const express = require('express');
const router = express.Router();

const {
    read,
    list,
    create,
    update,
    remove
} = require('../Controllers/doctor');

// const { auth } = require('../middleware/auth'); // Uncomment if needed
const { upload } = require('../middleware/upload');

router.get('/doctor', list);
router.get('/doctor/:id', read);
router.post('/doctor', upload, create);
router.put('/doctor/:id', upload, update); // FIXED: Added upload middleware here
router.delete('/doctor/:id', remove);

module.exports = router;
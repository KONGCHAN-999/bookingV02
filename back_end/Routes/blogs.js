// Routes file (no changes needed, included for reference)
const express = require('express');
const router = express.Router();

const {
    read,
    list,
    create,
    update,
    remove
} = require('../Controllers/blog')

const { auth } = require('../middleware/auth')

router.get('/blog', auth, list)
router.get('/blog/:id', auth, read)
router.post('/blog', auth, create)
router.put('/blog/:id', auth, update)
router.delete('/blog/:id', auth, remove)


module.exports = router;

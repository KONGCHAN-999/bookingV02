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

router.get('/blog', list)
router.get('/blog/:id', read)
router.post('/blog', create)
router.put('/blog/:id', update)
router.delete('/blog/:id', remove)

module.exports = router;


// Routes file (no changes needed, included for reference)
const express = require('express');
const router = express.Router();

const {
    read,
    list,
    create,
    update,
    remove
} = require('../Controllers/doctor')

router.get('/doctor', list)
router.get('/doctor/:id', read)
router.post('/doctor', create)
router.put('/doctor/:id', update)
router.delete('/doctor/:id', remove)


module.exports = router;

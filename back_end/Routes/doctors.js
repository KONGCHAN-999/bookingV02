
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

const { auth } = require('../middleware/auth')

router.get('/doctor',auth, list)
router.get('/doctor/:id',auth, read)
router.post('/doctor',auth, create)
router.put('/doctor/:id',auth, update)
router.delete('/doctor/:id',auth, remove)


module.exports = router;

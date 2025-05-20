const express = require('express');
const router = express.Router();

const {
    read,
    list,
    create,
    update,
    remove
} = require('../Controllers/booking')

const { auth } = require('../middleware/auth')

router.get('/booking',auth, list)
router.get('/booking/:id',auth, read)
router.post('/booking',auth, create)
router.put('/booking/:id',auth, update)
router.delete('/booking/:id',auth, remove)

module.exports = router;

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

router.get('/booking', list)
router.get('/booking/:id', read)
router.post('/booking', create)
router.put('/booking/:id', update)
router.delete('/booking/:id', remove)

module.exports = router;

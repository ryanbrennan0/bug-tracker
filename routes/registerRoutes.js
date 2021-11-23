const express = require('express');
const router = express.Router();

const registerController = require('../controllers/registerController');

router.get('/register', registerController.get_register);

router.post('/register', registerController.post_register);

module.exports = router;
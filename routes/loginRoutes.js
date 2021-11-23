const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController');

// redirects to login page
router.get('/', loginController.get_login);

router.post('/login', loginController.post_login);

module.exports = router;
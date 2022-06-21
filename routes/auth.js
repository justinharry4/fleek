const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/signup', authController.getSignup);
router.get('/signin', authController.getSignin);

module.exports = router;
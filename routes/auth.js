const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

// router.get('/sign-up', authController.getSignup);
router.get('/sign-in', authController.getSignin);

module.exports = router;
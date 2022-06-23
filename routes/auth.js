const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.use('/signup', authController.signup);
router.get('/signin', authController.getSignin);

module.exports = router;

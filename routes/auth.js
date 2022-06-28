const express = require('express');

const authController = require('../controllers/auth');
const validator = require('../util/validator');

const router = express.Router();

router.use('/signup', validator.signup, authController.signup);
router.get('/signin', authController.getSignin);
router.post('/complete-registration', authController.postCompleteRegistration)

module.exports = router;

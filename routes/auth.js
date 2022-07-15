const express = require('express');

const authController = require('../controllers/auth');
const validator = require('../util/validator');

const router = express.Router();

// DEFINING ROUTES
router.get('/signin', authController.getSignin);
router.post('/signin', authController.postSignin);

router.get('/signup', authController.getSignupStep1);
router.post('/signup', authController.postSignup);
router.get('/signup/regstep1', authController.getSignupStep1);

router.get('/signup/regform', authController.getSignupRegform);
router.post('/signup/regform', validator.signupRegform, authController.postSignupRegform)

router.get('/signup/regstep2', authController.getSignupStep2);

router.get('/signup/chooseplan', authController.getSignupChoosePlan);
router.post('/signup/chooseplan', validator.signupPlanform, authController.postSignupChoosePlan);

router.get('/signup/regstep3', authController.getSignupStep3);

router.get('/signup/creditoption', authController.getSignupCreditOption);
router.post('/signup/creditoption', authController.postSignupCreditOption)

// signout 
router.post('/signout', authController.postSignout);


module.exports = router;

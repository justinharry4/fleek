const express = require('express');

const controllers = require('./controllers');
const validators = require('./validators');
const middleware = require('./middleware');

const router = express.Router();

// DEFINING ROUTES
router.get('/signin', controllers.getSignin);
router.post('/signin', controllers.postSignin);

router.get('/signup', controllers.getSignupStep1);
router.post('/signup', controllers.postSignup);
router.get('/signup/regstep1', controllers.getSignupStep1);

router.get('/signup/regform', controllers.getSignupRegform);
router.post(
    '/signup/regform',
    validators.signupRegform,
    controllers.postSignupRegform
);

router.get(
    '/signup/regstep2',
    middleware.checkRegAccount,
    controllers.getSignupStep2
);

router.get(
    '/signup/chooseplan',
    middleware.checkRegAccount,
    controllers.getSignupChoosePlan
);
router.post(
    '/signup/chooseplan',
    middleware.checkRegAccount,
    validators.signupPlanform,
    controllers.postSignupChoosePlan
);

router.get(
    '/signup/regstep3',
    middleware.checkRegAccount,
    controllers.getSignupStep3
);

router.get(
    '/signup/creditoption',
    middleware.checkRegAccount,
    controllers.getSignupCreditOption
);
router.post(
    '/signup/creditoption',
    middleware.checkRegAccount,
    controllers.postSignupCreditOption
);

// signout 
router.post('/signout', controllers.postSignout);


module.exports = router;

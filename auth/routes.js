const express = require('express');

const controllers = require('./controllers');
const validators = require('./validators');
const middleware = require('./middleware');

const router = express.Router();

router.use('/', middleware.routeProtectionMiddleware);

// DEFINING ROUTES
router.get('/signin', controllers.getSignin);
router.post('/signin', controllers.postSignin);

router.post('/signout', controllers.postSignout);

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
    controllers.getSignupStep2
);

router.get(
    '/signup/chooseplan',
    controllers.getSignupChoosePlan
);
router.post(
    '/signup/chooseplan',
    validators.signupPlanform,
    controllers.postSignupChoosePlan
);

router.get(
    '/signup/regstep3',
    controllers.getSignupStep3
);

router.get(
    '/signup/creditoption',
    controllers.getSignupCreditOption
);
router.post(
    '/signup/creditoption',
    controllers.postSignupCreditOption
);


module.exports = router;

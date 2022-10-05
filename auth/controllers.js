const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const { User } = require('./models');
const fileUtil = require('../util/file');


module.exports.getSignin = async (req, res, next) => {
    let authDataPath = 'data/auth.json';

    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('auth/sign-in', {
        pageTitle: 'Fleek | Sign in',
        navList: navList,
        leadName: 'signin',
    });
};

module.exports.postSignin = async (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let rememberUser = req.body['remember-user'];

    let formData = { 
        email: email,
        password: password,
        remeberUser: rememberUser
    };

    let user = await User.findOne({email: email});
    if (!user){
        return res.redirect('/signin');
    }

    let hashedPassword = user.password;
    let passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch){
        return res.redirect('/signin');
    }

    req.session.userId = user._id;
    req.session.authenticated = true;
    if (rememberUser === 'true'){
        // remember user
    }

    res.redirect('/browse');
}

async function renderSignupView(req, res, next, steps){
    let signupStep = steps.signupStep;
    let nextSignupStep = steps.nextSignupStep;
    let regSubPlan = req.session.regSubPlan ? req.session.regSubPlan: 'premium';
    let regAccountCreated = req.session.regAccountCreated;
    let regUser = await User.findById(req.session.regUser);
    let regEmail = (regUser) ? regUser.email : req.session.regEmail;

    let authDataPath = 'data/auth.json';
    try {
        let dataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(dataString);
        let navList = authData.footerNavList;
        let subscriptionData;
        if (signupStep === 'chooseplan' || signupStep === 'creditoption'){
            subscriptionData = authData.subscriptionInfo;
        }
        res.render('auth/sign-up', {
            pageTitle: 'Fleek | Sign up',
            navList: navList,
            leadName: 'signup',
            signupStep: signupStep,
            nextSignupStep: nextSignupStep,
            subscriptionData: subscriptionData,
            regEmail: regEmail,
            regSubPlan: regSubPlan,
            regAccountCreated: regAccountCreated,
        })
    } catch (error){
        next(error);
    }
}

module.exports.getSignupStep1 = (req, res, next) => {
    let nextSignupStep = 'regstep1';
    let upperSignupStep = 'regform';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.postSignup = (req, res, next) => {
    if (req.body.email){
        req.session.regEmail = req.body.email
    }
    res.redirect('/signup');
};

module.exports.getSignupRegform = (req, res, next) => {
    let nextSignupStep = 'regform';
    let upperSignupStep = req.session.regAccountCreated ? 'regstep2': 'regform';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.postSignupRegform = async (req, res, next) => {
    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()){
        let errors = validationErrors.array();
        let message = errors[0].msg;
        let invalidFields = [];
        errors.forEach(err => {
            invalidFields.push(err.param);
        })

        return res.status(422).json({ message: message, fields: invalidFields });
    }

    // connect to database
    let email = req.body.email;
    let password = req.body.password;

    let existingUser = await User.findOne({email: email});
    if (existingUser){
        let message = 'A user with this email already exists.';
        let invalidFields = [];

        return res.status(422).json({ message: message, fields: invalidFields });
    }

    let hashedPassword = await bcrypt.hash(password, 12);
    let user = new User({
        email: email,
        password: hashedPassword
    });

    await user.save();
    req.session.regUser = user._id;
    req.session.regAccountCreated = true;

    let nextSignupStep = 'regstep2';
    let upperSignupStep = 'chooseplan';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.getSignupStep2 = (req, res, next) => {
    let nextSignupStep = 'regstep2';
    let upperSignupStep = 'chooseplan';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.getSignupChoosePlan = (req, res, next) => {
    let nextSignupStep = 'chooseplan';
    let upperSignupStep = 'chooseplan';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.postSignupChoosePlan = async (req, res, next) => {
    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()){
        let errors = validationErrors.array();
        let message = errors[0].msg;
        let invalidFields = [];

        return res.status(422).json({ message: message, fields: invalidFields });
    }

    let subPlan = req.body.subPlan;
    let userId = req.session.regUser;
    let user = await User.findById(userId);

    user.subscriptionPlan = subPlan;
    req.session.regSubPlan = subPlan;
    await user.save();

    let nextSignupStep = 'regstep3';
    let upperSignupStep = 'creditoption';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.getSignupStep3 = (req, res, next) => {
    let nextSignupStep = 'regstep3';
    let upperSignupStep = 'creditoption';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.getSignupCreditOption = (req, res, next) => {
    let nextSignupStep = 'creditoption';
    let upperSignupStep = '';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.postSignupCreditOption = async (req, res, next) => {
    let creditCardNo = req.body['card-number'];
    if (creditCardNo){
        // connect to database
    }

    let userId = req.session.regUser;
    let user = await User.findById(userId);
    user.member = true;
    await user.save();

    req.session.regEmail = null;
    req.session.regSubPlan = null;
    req.session.regUser = null;
    req.session.regAccountCreated = false;

    if (req.session.authenticated){
        res.redirect('/browse');
    } else {
        res.redirect('/signin');
    }
};

module.exports.postSignout = (req, res, next) => {
    // reset authenticated value

    req.session.regEmail = null;
    req.session.regSubPlan = null;
    req.session.regUser = null;
    req.session.regAccountCreated = false;

    req.session.userId = null;
    req.session.authenticated = false;
    req.session.userProfileId = null;
    req.session.regProfileId = null;

    res.sendStatus(201);
};


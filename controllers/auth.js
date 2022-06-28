const { validationResult } = require('express-validator');

const fileUtil = require('../util/file');

module.exports.getSignin = async (req, res, next) => {
    let authDataPath = 'data/auth.json';

    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('pages/auth/sign-in', {
        pageTitle: 'Fleek | Sign in',
        navList: navList,
        leadName: 'signin',
    })
};

module.exports.signup = async (req, res, next) => {
    let steps = ['step1', 'add-password', 'step2', 'choose-plan', 'step3', 'credit-option'];
    let reqData = req.method === 'GET' ? req.query: req.body;
    let nextSignupStep = 'step1';
    if (steps.find(step => step === reqData.step)){
        nextSignupStep = reqData.step;
    }

    if (nextSignupStep === 'step2'){
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
    }
    let regEmail = req.session.regEmail;
    let regSubPlan = req.session.regSubPlan;
    let accountInfo = reqData.accountInfo;
    if (reqData.email && nextSignupStep === 'step1' && req.method === 'POST'){
        req.session.regEmail = reqData.email;
    }

    if (accountInfo === 'credentials' && req.method === 'POST'){
        // reach out to database
        let email = reqData.email;
        let password = reqData.password;
        console.log('email:', email);
        console.log('password:', password);
    } else if (accountInfo === 'subscription-plan' && req.method === 'POST'){
        //  reach out to database
        req.session.regSubPlan = reqData.subPlan;
        console.log('selected plan:', reqData.subPlan);
    }

    let stepIndex = steps.findIndex(step => step === nextSignupStep);
    let upperSignupStep = steps[stepIndex + 1];

    let authDataPath = 'data/auth.json';
    try {
        let dataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(dataString);
        let navList = authData.footerNavList;
        let subscriptionData;
        if (nextSignupStep === 'choose-plan' || nextSignupStep === 'credit-option'){
            subscriptionData = authData.subscriptionInfo;
        }
        res.render('pages/auth/sign-up', {
            pageTitle: 'Fleek | Sign up',
            navList: navList,
            leadName: 'signup',
            signupStep: nextSignupStep,
            nextSignupStep: upperSignupStep,
            subscriptionData: subscriptionData,
            regEmail: regEmail,
            regSubPlan: regSubPlan,
        })
    } catch (error){
        next(error);
    }
};

module.exports.postCompleteRegistration = (req, res, next) => {
    let body = req.body;
    console.log(body);

    res.redirect('/auth/signin');
};
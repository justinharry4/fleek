const { selectFields } = require('express-validator/src/select-fields');
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
    let accountInfo = reqData.accountInfo;
    if (accountInfo === 'credentials' && req.method === 'POST'){
        // reach out to database
        let email = reqData.email;
        let password = reqData.password;
        console.log('email', email);
        console.log('password', password)
    } else if (accountInfo === 'subscription-plan'){
        //  do stuff
    } else if (accountInfo === 'credit-info'){

    }

    let stepIndex = steps.findIndex(step => step === nextSignupStep);
    let upperSignupStep = steps[stepIndex + 1];

    let authDataPath = 'data/auth.json';
    try {
        let dataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(dataString);
        let navList = authData.footerNavList;
        let subscriptionData;
        if (nextSignupStep === 'choose-plan'){
            subscriptionData = authData.subscriptionInfo;
        }
        res.render('pages/auth/sign-up', {
            pageTitle: 'Fleek | Sign up',
            navList: navList,
            leadName: 'signup',
            signupStep: nextSignupStep,
            nextSignupStep: upperSignupStep,
            subscriptionData: subscriptionData,
        })
    } catch (error){
        next(error);
    }
};
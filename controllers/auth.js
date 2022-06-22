const { selectFields } = require('express-validator/src/select-fields');
const fileUtil = require('../util/file');

module.exports.getSignin = async (req, res, next) => {
    let authDataPath = 'data/authpage-data.json';

    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('pages/auth/sign-in', {
        pageTitle: 'Fleek | Sign in',
        navList: navList,
        leadName: 'signin',
    })
};

module.exports.getSignup = async (req, res, next) => {
    let steps = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    let reqData = req.query || req.body;
    let signupStep = reqData['signup-step'];
    let accountInfo = reqData.accountInfo;
    if (accountInfo === 'credentials'){
        // do stuff
    } else if (accountInfo === 'subscription-plan'){
        //  do stuff
    } else if (accountInfo === 'credit-info'){

    } else {

    }
    let stepIndex = steps.findIndex(step => step === signupStep);
    let nextSignupStep = steps[stepIndex + 1]

    let authDataPath = 'data/authpage-data.json';
    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('pages/auth/sign-up', {
        pageTitle: 'Fleek | Sign up',
        navList: navList,
        leadName: 'signup',
        signupStep: nextSignupStep,
    })
};


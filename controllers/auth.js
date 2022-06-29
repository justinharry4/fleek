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

async function renderSignupView(req, res, next, steps){
    let signupStep = steps.signupStep;
    let nextSignupStep = steps.nextSignupStep;
    let regEmail = req.session.regEmail;
    let regSubPlan = req.session.regSubPlan;

    let authDataPath = 'data/auth.json';
    try {
        let dataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(dataString);
        let navList = authData.footerNavList;
        let subscriptionData;
        if (signupStep === 'chooseplan' || signupStep === 'creditoption'){
            subscriptionData = authData.subscriptionInfo;
        }
        res.render('pages/auth/sign-up', {
            pageTitle: 'Fleek | Sign up',
            navList: navList,
            leadName: 'signup',
            signupStep: signupStep,
            nextSignupStep: nextSignupStep,
            subscriptionData: subscriptionData,
            regEmail: regEmail,
            regSubPlan: regSubPlan,
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
    let upperSignupStep = 'regform';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps);
};

module.exports.postSignupRegform = (req, res, next) => {
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

    console.log('email:', email);
    console.log('password:', password);

    let nextSignupStep = 'regstep2';
    let upperSignupStep = 'chooseplan';
    let steps = { 
        signupStep: nextSignupStep,
        nextSignupStep: upperSignupStep
    };

    renderSignupView(req, res, next, steps)
};

module.exports.getSignupStep2 = (req, res, next) => {
    console.log('trying to get step 2');
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

module.exports.postSignupChoosePlan = (req, res, next) => {
    if (req.body.subPlan){
        req.session.regSubPlan = req.body.subPlan;
    }
    // connect to database
    let subPlan = req.body.subPlan;

    console.log('selected subplan: ', subPlan);

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

module.exports.postSignupCreditOption = (req, res, next) => {
    let creditCardNo = req.body['card-number'];
    if (creditCardNo){
        // connect to database
    }

    console.log('card-no:', creditCardNo);

    res.redirect('/signin');
};

// module.exports.signup = async (req, res, next) => {
//     let steps = ['step1', 'add-password', 'step2', 'choose-plan', 'step3', 'credit-option'];
//     let reqData = req.method === 'GET' ? req.query: req.body;
//     let nextSignupStep = 'step1';
//     if (steps.find(step => step === reqData.step)){
//         nextSignupStep = reqData.step;
//     }

//     if (nextSignupStep === 'step2'){
//         let validationErrors = validationResult(req);
//         if (!validationErrors.isEmpty()){
//             let errors = validationErrors.array();
//             let message = errors[0].msg;
//             let invalidFields = [];
//             errors.forEach(err => {
//                 invalidFields.push(err.param);
//             })
//             return res.status(422).json({ message: message, fields: invalidFields });
//         }
//     }
//     let regEmail = req.session.regEmail;
//     let regSubPlan = req.session.regSubPlan;
//     let accountInfo = reqData.accountInfo;
//     if (reqData.email && nextSignupStep === 'step1' && req.method === 'POST'){
//         req.session.regEmail = reqData.email;
//     }

//     if (accountInfo === 'credentials' && req.method === 'POST'){
//         // reach out to database
//         let email = reqData.email;
//         let password = reqData.password;
//         console.log('email:', email);
//         console.log('password:', password);
//     } else if (accountInfo === 'subscription-plan' && req.method === 'POST'){
//         //  reach out to database
//         req.session.regSubPlan = reqData.subPlan;
//         console.log('selected plan:', reqData.subPlan);
//     }

//     let stepIndex = steps.findIndex(step => step === nextSignupStep);
//     let upperSignupStep = steps[stepIndex + 1];

//     let authDataPath = 'data/auth.json';
//     try {
//         let dataString = await fileUtil.loadFile(authDataPath);
//         let authData = JSON.parse(dataString);
//         let navList = authData.footerNavList;
//         let subscriptionData;
//         if (nextSignupStep === 'choose-plan' || nextSignupStep === 'credit-option'){
//             subscriptionData = authData.subscriptionInfo;
//         }
//         res.render('pages/auth/sign-up', {
//             pageTitle: 'Fleek | Sign up',
//             navList: navList,
//             leadName: 'signup',
//             signupStep: nextSignupStep,
//             nextSignupStep: upperSignupStep,
//             subscriptionData: subscriptionData,
//             regEmail: regEmail,
//             regSubPlan: regSubPlan,
//         })
//     } catch (error){
//         next(error);
//     }
// };
const fileUtil = require('../util/file');

module.exports.getSignin = async (req, res, next) => {
    let authDataPath = 'data/authpage-data.json';

    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('pages/auth/sign-in', {
        pageTitle: 'Fleek | Sign in',
        navList: navList,
        leadAuthName: 'signin',
    })
};

module.exports.getSignup = async (req, res, next) => {
    let authDataPath = 'data/authpage-data.json';

    let dataString = await fileUtil.loadFile(authDataPath);
    let authData = JSON.parse(dataString);
    let navList = authData.footerNavList;

    res.render('pages/auth/sign-up', {
        pageTitle: 'Fleek | Sign up',
        navList: navList,
        leadAuthName: 'signup',
    })
};

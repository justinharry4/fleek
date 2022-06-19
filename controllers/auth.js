const fileUtil = require('../util/file');

module.exports.getSignin = async (req, res, next) => {
    let signinDataPath = 'data/signin-data.json';

    let dataString = await fileUtil.loadFile(signinDataPath);
    let signinData = JSON.parse(dataString);
    let navList = signinData.footerNavList;

    res.render('pages/auth/sign-in', {
        pageTitle: 'Fleek | Sign in',
        navList: navList,
    })
};

module.exports.getSignup = async (req, res, next) => {

};

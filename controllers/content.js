const fileUtil = require('../util/file');

const ROOTDIR = fileUtil.ROOTDIR;

module.exports.getIndex = async (req, res, next) => {
    let regAccountCreated = req.session.regAccountCreated;
    let homePageDataPath = 'data/home.json';
    
    try {
        let dataString = await fileUtil.loadFile(homePageDataPath);
        let homePageData = JSON.parse(dataString);
        let faqList = homePageData.faqList;
        let navList = homePageData.footerNavList;

        res.render('pages/index', {
            pageTitle: 'Fleek',
            faqList: faqList,
            navList: navList,
            leadName: 'home',
            regAccountCreated: regAccountCreated,
        })
    } catch (error){
        next(error);
    }
};

const fileUtil = require('./utils/file');

module.exports.getIndex = async (req, res, next) => {
    let regAccountCreated = req.session.regAccountCreated;
    let homePageDataPath = 'core/data/home.json';

    let dataString = await fileUtil.loadFile(homePageDataPath);
    let homePageData = JSON.parse(dataString);
    let faqList = homePageData.faqList;
    let navList = homePageData.footerNavList;

    res.render('core/index', {
        pageTitle: 'Fleek',
        faqList: faqList,
        navList: navList,
        leadName: 'home',
        regAccountCreated: regAccountCreated,
    });
};

module.exports.get404 = (req, res, next) => {
    res.status(404).render('core/404', {
        pageTitle: 'Page Not Found'
    });
};

module.exports.get500 = (req, res, next) => {
    let type = req.query.type;

    if (!type || type === 'html'){
        return res.status(500).render('core/500', {
            pageTitle: 'Internal Server Error'
        })
    } 
    if (type === 'json'){
        return res.status(500).json({message: 'An internal error occured'});
    }
};
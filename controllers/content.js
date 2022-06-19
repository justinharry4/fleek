const fs = require('fs');
const path = require('path');

module.exports.getIndex = (req, res, next) => {
    let faqFilePath = path.join(__dirname, '..', 'data', 'home-data.json');
    fs.readFile(faqFilePath, (err, data) => {
        if (err){
            return next(err);
        }
        let homePageData = JSON.parse(data);
        let faqList = homePageData.faqList;
        let navList = homePageData.footerNavList;
        res.render('pages/content/index', {
            pageTitle: 'Fleek',
            faqList: faqList,
            navList: navList,
        })
    })
}


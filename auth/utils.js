const fileUtil = require('../core/utils/file');

module.exports.getFooterNavList = async () => {
    let footerDataPath = 'core/data/footer-slim.json';
    let footerDataString = await fileUtil.loadFile(footerDataPath);
    let footerData = JSON.parse(footerDataString);
    let navList = footerData.footerNavList;

    return navList;
}

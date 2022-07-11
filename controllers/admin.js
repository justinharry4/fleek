const TMDB = require('../database/tmdb');

module.exports.getSetGeneralWriteInterval = (req, res, next) => {
    res.render('pages/admin/write-interval', {
        pageTitle: 'Fleek Admin',
        interval: 'general',
    })
}

module.exports.postSetGeneralWriteInterval = (req, res, next) => {
    let durationStr = req.body.durationStr;
    if (durationStr.split('-').length !== 2){
        return res.status(422).json({message: 'Invalid Duration String'});
    }

    TMDB.generalWriteInterval = durationStr;
    res.status(201).json({message: 'generalWriteInterval Successfully changed'});
};

module.exports.getSetCategoryWriteInterval = (req, res, next) => {
    res.render('pages/admin/write-interval', {
        pageTitle: 'Fleek Admin',
        interval: 'category',
    })
};

module.exports.postSetCategoryWriteInterval = (req, res, next) => {
    let categoryName = req.body.category;
    let durationStr = req.body.durationStr;
    let force = req.body.force === 'true' ? true : false;

    if (durationStr.split('-').length !== 2){
        return res.status(422).json({message: 'Invalid Duration String'});
    }
    
    TMDB.setWriteInterval(categoryName, durationStr , force);
    res.status(201).json({message: 'category writeInterval successfully changed'});
};
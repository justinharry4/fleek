const fs = require('fs');
const path = require('path');

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
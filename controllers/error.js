const fs = require('fs');
const path = require('path');

module.exports.get404 = (req, res, next) => {
    res.status(404).render('pages/error/404', {
        pageTitle: 'Page Not Found'
    });
};

module.exports.get500 = (req, res, next) => {
    res.status(500).render('pages/error/500', {
        pageTitle: 'Internal Server Error'
    })
};
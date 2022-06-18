const fs = require('fs');
const path = require('path');

module.exports.get404 = (req, res, next) => {
    res.render('pages/error/404', {
        pageTitle: 'Page Not Found'
    });
}

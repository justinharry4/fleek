const bodyParser = require('body-parser');
const session = require('express-session');

const config = require('../config/config');
const { sessionStore } = require('./config');
const { makePath } = require('./utils/file');

// Third-party middleware
module.exports.UrlEncodedParserMiddleware = bodyParser.urlencoded({
    extended: false,
});

module.exports.sessionsMiddleware = session({
    secret: [config.SESSION_SECRET],
    saveUninitialized: false,
    resave: false,
    store: sessionStore
});

// User-defined middleware
module.exports.responseLocalsMiddleware = (req, res, next) => {
    res.locals = {
        coreRoot: makePath('core/views/core'),
        svgRoot: makePath('assets/images/svg'),
    }
    next();
}

module.exports.topLevelErrorMiddleware = (error, req, res, next) => {
    console.log('INSIDE ERROR HANDLER\n', error);
    
    if (!error.data || error.data.resType === 'text/html'){
        return res.redirect('/server-error');
    }
    if (error.data.resType === 'application/json'){
        return res.redirect('/server-error?type=json')
    }
};

module.exports.session = session;

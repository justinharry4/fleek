const express = require('express');
const session = require('express-session');
const mongoDbSessionStore = require('connect-mongodb-session')(session);

const features = require('../config/features');
const config = require('../config/config');
const { makePath } = require('./utils/file');


const VIEWENGINE = 'ejs';

const SESSIONS_COLLECTION = 'sessions';
const sessionStore = new mongoDbSessionStore({
    uri: config.MONGO_DB_URI,
    collection: SESSIONS_COLLECTION,
});

// HELPER FUNCTIONS
function getViewDirs(){
    let viewDirs = [];

    for (let feature of features){
        let dirPath = makePath(feature + '/views');
        viewDirs.push(dirPath);
    }

    return viewDirs;
}

// EXPORTS
module.exports.sessionStore = sessionStore;

module.exports.configureViews = (app) => {
    app.set('view engine', VIEWENGINE);
    app.set('views', getViewDirs());
}

module.exports.configureStatic = (app) => {
    for (let feature of features){
        let publicPath = makePath(feature + '/public');
        app.use(express.static(publicPath));
    }

    let assetsPath = makePath('assets');
    app.use(express.static(assetsPath));
};

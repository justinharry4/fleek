const express = require('express');
const session = require('express-session');
const mongoDbSessionStore = require('connect-mongodb-session')(session);

const features = require('../config/features');
const config = require('../config/config');
const events = require('./events/events');
const handlers = require('./events/handlers');
const { routeEmitter, dbEmitter } = require('./events/emitters');
const { makePath, dirExists, ROOTDIR } = require('./utils/file');


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

let registerFeatureRoutesOld = (featureName, routePrefix) => {
    if (!dirExists(featureName, ROOTDIR)){
        throw new Error(
            'Route registration failed. ' +
            `Feature directory \`${featureName}\` does not exist.`
        );
    }

    let registerFeatureRouter = handlers.getRegisterFeatureRouter(
        featureName,
        routePrefix
    );

    if (routeEmitter.routerCount === 0){
        dbEmitter.once(events.POST_DB_CONNECTION, registerFeatureRouter);
        return routeEmitter.routerCount++;
    }

    routeEmitter.addListenerToQueue(registerFeatureRouter);
};

module.exports.registerFeatureRoutes = (routePrefix, featureName) => {
    if (!featureName){
        featureName = routePrefix;
        routePrefix = null;
    }

    if (!dirExists(featureName, ROOTDIR)){
        throw new Error(
            'Route registration failed. ' +
            `Feature directory \`${featureName}\` does not exist.`
        );
    }

    let registerFeatureRouter = handlers.getRegisterFeatureRouter(
        featureName,
        routePrefix
    );

    dbEmitter.once(events.POST_DB_CONNECTION, registerFeatureRouter);
};

module.exports.registerErrorMiddleware = (middleware) => {
    let registerErrorMiddleware = handlers.getRegisterErrorMiddleware(middleware);

    routeEmitter.once(
        events.POST_FINAL_ROUTE_REGISTRATION,
        registerErrorMiddleware
    );
};

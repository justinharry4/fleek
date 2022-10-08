const express = require('express');

const coreConfig = require('./core/config');
let middleware = require('./core/middleware');
const { startServer } = require('./core/server');
const { makeSafe } = require('./core/utils/middleware');

middleware = makeSafe(middleware);

const app = express();

coreConfig.configureViews(app);
coreConfig.configureStatic(app);

// CATCH-ALL MIDDLEWARE (third-party)
app.use(middleware.UrlEncodedParserMiddleware);
app.use(middleware.sessionsMiddleware);

// CATCH-ALL MIDDLEWARE
app.use(middleware.authenticationMiddleware);
app.use(middleware.responseLocalsMiddleware);

// ROUTES
coreConfig.registerFeatureRoutes('auth');
coreConfig.registerFeatureRoutes('/profiles', 'profiles');
coreConfig.registerFeatureRoutes('content');
coreConfig.registerFeatureRoutes('core');

// ERROR-HANDLING MIDDLEWARE
coreConfig.registerErrorMiddleware(middleware.errorMiddleware);

startServer(app);
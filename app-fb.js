const express = require('./express');

const coreConfig = require('./core/config');
const errorRouter = require('./core/routes');
const { startServer } = require('./core/server');
let middleware = require('./core/middleware');
const authRouter = require('./auth/routes');
const profilesRouter = require('./profiles/routes');
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
app.use(authRouter);
app.use('/profiles', profilesRouter);
app.use(errorRouter);

// ERROR-HANDLING MIDDLEWARE
app.use(middleware.errorMiddleware);

startServer(app);
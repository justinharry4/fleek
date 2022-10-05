const express = require('express');

let controllers = require('./controllers');
const { makeSafe } = require('./utils/middleware');

controllers = makeSafe(controllers);

const router = express.Router();

// ERROR ROUTES
router.use('/server-error', controllers.get500);
router.use('/', controllers.get404);

module.exports = router;
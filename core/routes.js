const express = require('express');

let controllers = require('./controllers');
const { makeSafe } = require('./utils/middleware');

controllers = makeSafe(controllers);

const router = express.Router();

// index route
router.get('/', controllers.getIndex);

// error routes
router.use('/server-error', controllers.get500);

router.use('/', controllers.get404);

module.exports = router;
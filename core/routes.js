const express = require('express');

const controllers = require('./controllers');

const router = express.Router();

// ERROR ROUTES
router.use('/server-error', controllers.get500);
router.use('/', controllers.get404);

module.exports = router;
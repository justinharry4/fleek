const express = require('express');

let controllers = require('./controllers');
let middleware = require('../auth/middleware');
const { makeSafe } = require('../core/utils/middleware');

controllers = makeSafe(controllers);
middleware = makeSafe(middleware);

const router = express.Router();

router.use(middleware.checkAuthMiddleware);

router.get('/browse', controllers.getBrowse);

router.get('/content/:contentId', controllers.getContent);

module.exports = router;
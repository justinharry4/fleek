const express = require('express');

const errorController = require('../controllers/error');

const router = express.Router();

router.use('/server-error', errorController.get500);
router.use('/', errorController.get404);

module.exports = router;
const express = require('express');

const errorController = require('../controllers/error');

const router = express.Router();

router.get('/server-error', errorController.get500);
router.get('/', errorController.get404);

module.exports = router;
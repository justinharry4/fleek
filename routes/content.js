const express = require('express');

const contentController = require('../controllers/content');

const router = express.Router();

router.get('/', contentController.getIndex);

router.get('/browse', contentController.getBrowse);

module.exports = router;
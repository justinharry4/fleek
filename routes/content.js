const express = require('express');

const contentController = require('../controllers/content');

const router = express.Router();

router.get('/', contentController.getIndex);

router.get('/firstmovie', contentController.getCreateFirstMovie);
router.get('/firsttvshow', contentController.getCreateFirstTvShow);

module.exports = router;
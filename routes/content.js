const express = require('express');

const contentController = require('../controllers/content');

const router = express.Router();

router.get('/', contentController.getIndex);

module.exports = router;
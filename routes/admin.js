const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/admin/general', adminController.getSetGeneralWriteInterval);
router.post('/admin/general', adminController.postSetGeneralWriteInterval);

router.get('/admin/category', adminController.getSetCategoryWriteInterval);
router.post('/admin/category', adminController.postSetCategoryWriteInterval);

module.exports = router;
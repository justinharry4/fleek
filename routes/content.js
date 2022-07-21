const express = require('express');

const contentController = require('../controllers/content');
const authUtil = require('../util/middleware/auth');

const router = express.Router();

router.get('/', contentController.getIndex);

router.get('/browse',
    authUtil.checkAuth,
    contentController.getBrowse
);

router.get('/profile',
    authUtil.checkAuth,
    contentController.getProfile,
);

router.get('/profile/addprofile', 
    authUtil.checkAuth,
    contentController.getAddProfile,
)

router.get('/profiles',
    authUtil.checkAuth,
    contentController.getProfiles
)

module.exports = router;
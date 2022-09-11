const express = require('express');

const contentController = require('../controllers/content');
const authUtil = require('../util/middleware/auth');

const router = express.Router();

// HTML-RESPONSE ROUTES
router.get('/', contentController.getIndex);

router.get('/browse',
    authUtil.checkAuth,
    contentController.getBrowse
);

router.get('/profiles',
    authUtil.checkAuth,
    contentController.getProfiles
);

router.get('/profiles/addprofile', 
    authUtil.checkAuth,
    contentController.getAddProfile,
);

router.post('/profiles/create',
    authUtil.checkAuth,
    contentController.postCreateProfile,
);

router.get('/profiles/languagesetup',
    authUtil.checkAuth,
    contentController.getLanguageSetup,
);

router.post('/profiles/languagesetup',
    authUtil.checkAuth,
    contentController.postLanguageSetup,
);

router.get('/profiles/setup',
    authUtil.checkAuth,
    contentController.getProfileListSetup,
);

router.post('/profiles/setup',
    authUtil.checkAuth,
    contentController.postProfileListSetup,
);

router.get('/profiles/editprofile',
    authUtil.checkAuth,
    contentController.getEditProfile,
);

router.post('/profiles/editprofile',
authUtil.checkAuth,
contentController.postEditProfile,
);

router.get('/manageprofiles', 
    authUtil.checkAuth,
    contentController.getManageProfiles,
)

// JSON-RESPONSE ROUTES
router.post('/switchprofile', 
    authUtil.checkAuth,
    contentController.postSwitchProfile,
);

router.get('/content/:contentId',
    authUtil.checkAuth,
    contentController.getContent,
)

module.exports = router;
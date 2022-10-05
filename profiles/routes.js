const express = require('express');

let controllers = require('./controllers');
let middleware = require('../auth/middleware');
const { makeSafe } = require('../core/utils/middleware');

controllers = makeSafe(controllers);
middleware = makeSafe(middleware);

const router = express.Router();

router.use(middleware.checkAuthMiddleware);

// HTML-RESPONSE ROUTES
router.get('/',
    controllers.getProfiles
);

router.get('/addprofile', 
    controllers.getAddProfile,
);

router.post('/create',
    controllers.postCreateProfile,
);

router.get('/languagesetup',
    controllers.getLanguageSetup,
);

router.post('/languagesetup',
    controllers.postLanguageSetup,
);

router.get('/setup',
    controllers.getProfileListSetup,
);

router.post('/setup',
    controllers.postProfileListSetup,
);

router.get('/editprofile',
    controllers.getEditProfile,
);

router.post('/editprofile',
    controllers.postEditProfile,
);  

router.get('/deleteprofile',
    controllers.getDeleteProfile,
);

router.post('/deleteprofile',
    controllers.postDeleteProfile,
);

router.get('/manage', 
    controllers.getManageProfiles,
)

// JSON-RESPONSE ROUTES
router.post('/switch', 
    controllers.postSwitchProfile,
);


module.exports = router;

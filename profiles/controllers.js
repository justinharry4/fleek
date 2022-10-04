const { Profile } = require('./models');
const { Movie, TvShow } = require('../content/models');
const tmdb = require('../content/tmdb');
const fileUtil = require('../core/utils/file');
const { isUserProfile } = require('./utils');


module.exports.getProfiles = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        res.render('profiles/profiles', {
            pageTitle: 'Fleek',
            leadName: 'profiles',
            profiles: profiles,
            mode: 'profiles-list',
        });
    } catch (error){
        next(error);
    }
}

module.exports.getManageProfiles = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        res.setHeader('Resource-Location', '/profiles/manage');

        res.render('profiles/profiles', {
            pageTitle: 'Fleek',
            leadName: 'profiles',
            profiles: profiles,
            mode: 'manage-profiles',
        });
    } catch (error){
        next(error);
    }
};

module.exports.getAddProfile = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        res.render('profiles/add-profile', {
            pageTitle: 'Fleek',
            leadName: 'addProfile',
            profiles: profiles,
        });
    } catch (error){
        next(error);
    }
}

module.exports.postCreateProfile = async (req, res, next) => {
    let user = req.data.user;
    let profileName = req.body.profileName;
    let isKid = req.body.kid === 'kid' ? true : false;
    
    try {
        let profile = new Profile({
            name: profileName,
            kid: isKid,
            user: user._id,
        });
        await profile.save();

        user.profiles.push(profile._id);
        await user.save();

        exports.getProfiles(req, res, next);
    } catch(error){
        next(error);
    }
};

module.exports.getLanguageSetup = async (req, res, next) => {
    let profileId = req.query.profileId || req.session.regProfileId;

    try {
        let profile = await Profile.findById(profileId);
        if (!profile){
            return res.redirect('/browse');
        }
        
        let languagesDataPath = 'data/languages.json';
        let languagesDataStr = await fileUtil.loadFile(languagesDataPath);
        let languagesData = JSON.parse(languagesDataStr);
        let languages = languagesData.languages;
        let column1Length = Math.ceil(languages.length / 2);
        let column1 = languages.slice(0, column1Length);
        let column2 = languages.slice(column1Length);
        let langData = [column1, column2];

        let authDataPath = 'data/auth.json';
        let authDataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(authDataString);
        let navList = authData.footerNavList;

        res.render('profiles/language-setup', {
            pageTitle: 'Fleek',
            leadName: 'languageSetup',
            navList: navList,
            langData: langData,
            profileId: profileId
        });
    } catch (error){
        next(error);
    }
};

module.exports.postLanguageSetup = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.body.profileId;
    let defaultLang = req.body.defaultLang;
    let otherLangs = [].concat(req.body.otherLang);

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/browse');
        }

        profile.settings.defaultLanguage = defaultLang;
        profile.settings.otherLanguages = otherLangs[0] ? otherLangs : [];
        profile.setupStage = 1;
        await profile.save();

        req.session.regProfileId = profile._id;

        res.redirect('/profiles/setup');
    } catch(error){
        next(error);
    }
};

module.exports.getProfileListSetup = async (req, res, next) => {
    let profileId = req.query.profileId || req.session.regProfileId;
    
    try {
        let profile = await Profile.findById(profileId);
        if (!profile){
            return res.redirect('/browse');
        }

        let tvShowCount = 13;
        let movieCount = 12;
        let tvShows = await TvShow.find().limit(tvShowCount);
        let movies = await Movie.find().limit(movieCount);
        let relPathContent = tvShows.concat(movies);
        let fullPathContent = relPathContent.map(doc => {
            doc.coverPath = tmdb.imageBaseUrl + '/w92' + doc.coverPath;
            return doc;
        });

        let authDataPath = 'data/auth.json';
        let authDataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(authDataString);
        let navList = authData.footerNavList;

        res.render('profiles/setup', {
            pageTitle: 'Fleek',
            leadName: 'setup',
            navList: navList,
            profile: profile,
            contentList: fullPathContent,
        })
    } catch (error){
        next(error);
    }
};

module.exports.postProfileListSetup = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.body.profileId;
    let selectedContentIds = req.body.contentId;

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/browse');
        }

        profile.list = [].concat(selectedContentIds);
        profile.setupStage = 2;
        await profile.save();

        req.session.userProfileId = profile._id;
        req.session.regProfileId = null;

        res.redirect('/profiles/setup');
    } catch(error){
        next(error);
    }
};

module.exports.getEditProfile = async (req, res, next) => {
    let user = await req.data.user;
    let profileId = req.query.profileId;

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/profiles/manage');
        }

        return res.render('profiles/edit-profile', {
            pageTitle: 'Fleek',
            leadName: 'editProfile',
            profile: profile,
        });
    } catch(error){
        next(error);
    }
};

module.exports.postEditProfile = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.body.profileId;
    let profileName = req.body.profileName;

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/profiles/manage');
        }

        profile.name = profileName;
        await profile.save();

        exports.getManageProfiles(req, res, next);
    } catch (error){
        next(error);
    }
};

module.exports.getDeleteProfile = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.query.profileId;

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/profiles/manage');
        }

        return res.render('profiles/delete-profile', {
            pageTitle: 'Fleek',
            leadName: 'deleteProfile',
            profile: profile,
        })
    } catch(error){
        next(error);
    }
};

module.exports.postDeleteProfile = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.body.profileId;

    try {
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.redirect('/profiles/manage');
        }

        await profile.delete();

        let cleanedProfiles = user.profiles.filter((id) => {
            return id.toString() !== profileId.toString();
        });
        user.profiles = cleanedProfiles;
        await user.save();

        return res.redirect('/profiles/manage');
    } catch(error){
        next(error);
    }
};

// JSON-RESPONSE CONTROLLER FUNCTIONS
module.exports.postSwitchProfile = async (req, res, next) => {
    let profileId = req.body.profileId;

    try {
        let user = req.data.user;
        
        let profile = await isUserProfile(profileId, user);
        if (!profile){
            return res.status(422).json({message: 'Invalid profile ID'});
        }

        req.session.userProfileId = profile._id;
        res.status(201).json({message: 'Profile switch successful'})
    } catch(error){
        error.data = { resType: 'application/json' };
        next(error);
    }
};
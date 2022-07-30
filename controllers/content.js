const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const User = require('../models/user');
const Profile = require('../models/profile');
const fileUtil = require('../util/file');

module.exports.getIndex = async (req, res, next) => {
    let regAccountCreated = req.session.regAccountCreated;
    let homePageDataPath = 'data/home.json';
    
    try {
        let dataString = await fileUtil.loadFile(homePageDataPath);
        let homePageData = JSON.parse(dataString);
        let faqList = homePageData.faqList;
        let navList = homePageData.footerNavList;

        res.render('pages/index', {
            pageTitle: 'Fleek',
            faqList: faqList,
            navList: navList,
            leadName: 'home',
            regAccountCreated: regAccountCreated,
        })
    } catch (error){
        next(error);
    }
};

async function getContent (profileId, req, res, next){
    try {
        let profile = await Profile.findById(profileId);
        if (!profile){
            return res.redirect('/browse');
        }
        if (!profile.setupComplete){
            req.session.regProfileId = profile._id;
            return exports.getLanguageSetup(req, res, next);
        }

        res.render('pages/content/browse', {
            pageTitle: 'Fleek',
            leadName: 'browse',
        });
    } catch(error){
        next(err);
    }
}

module.exports.getBrowse = async (req, res, next) => {
    let user = req.data.user;
    let sProfileId = req.session.userProfileId;
    let qProfileId = req.query.profileId;

    try {
        if (qProfileId){
            return getContent(qProfileId, req, res, next);
        }

        let isUserProfile;
        let userProfilesStr = user.profiles.map(pid => pid.toString());
        if (sProfileId){
            isUserProfile = userProfilesStr.includes(sProfileId.toString());
        }
        
        if (!sProfileId || !isUserProfile){
            return exports.getProfiles(req, res, next);
        }

        getContent(sProfileId, req, res, next)
    } catch (error){
        next(error);
    }
};

module.exports.getProfiles = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        res.render('pages/content/profiles', {
            pageTitle: 'Fleek',
            leadName: 'profiles',
            profiles: profiles,
        });
    } catch (error){
        next(error);
    }
}

module.exports.getAddProfile = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        res.render('pages/content/add-profile', {
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
        let validProfile = await Profile.findById(profileId);
        if (!validProfile){
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

        res.render('pages/content/language-setup', {
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
    
};

module.exports.getProfileSetup = async (req, res, next) => {
    let profileId = req.query.profileId || req.session.regProfileId;
    
    try {
        let validProfile = await Profile.findById(profileId);
        if (!validProfile){
            return res.redirect('/browse');
        }

        res.render('pages/content/setup', {
            pageTitle: 'Fleek',
            leadName: 'setup',
            profileId: profileId
        });
    } catch (error){
        next(error);
    }
};

module.exports.getProfile = async (req, res, next) => {
    try {
        let userId = req.session.userId;
        let user = await User.findById(userId).populate('profiles');
        let userProfiles = user.profiles;

        res.render('pages/content/profile', {
            pageTitle: 'Fleek',
            leadName: 'profile',
        });
    } catch (error){
        next(error);
    }
}
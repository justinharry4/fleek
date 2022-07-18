const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const User = require('../models/user');
const Profile = require('../models/profile');
const fileUtil = require('../util/file');
const tmdbUtil = require('../util/config');

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

module.exports.getBrowse = async (req, res, next) => {
    let user = req.data.user;
    let profileId = req.session.userProfileId;

    try {
        let isUserProfile;
        let userProfilesStr = user.profiles.map(pid => pid.toString());
        if (profileId){
            isUserProfile = userProfilesStr.includes(profileId.toString());
        } else {
            isUserProfile = false;
        }
        
        if (!profileId || !isUserProfile){
            return exports.getProfiles(req, res, next);
        }
        
        let profile = await Profile.findById(profileId);

        res.render('pages/content/browse', {
            pageTitle: 'Fleek',
            leadName: 'browse',
        });
    } catch (error){
        next(error);
    }
};

module.exports.getProfiles = async (req, res, next) => {
    try {
        let user = await req.data.user.populate('profiles');
        let profiles = user.profiles;

        // if (profiles.length === 0){
        //     let firstProfile = new Profile({name: 'profile1', user: user._id, kid: false});
        //     let secProfile = new Profile({name: 'profile2', user: user._id, kid: false});
        //     profiles.push(firstProfile, secProfile);
        // }

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
            leadName: 'add-profile',
            profiles: profiles,
        });
    } catch (error){
        next(error);
    }
}

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
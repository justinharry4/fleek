// THIRD-PARTY MODULES

// USER-DEFINED MODULES
const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const User = require('../models/user');
const Profile = require('../models/profile');
const TMDB = require('../database/tmdb');
const fileUtil = require('../util/file');
const modelUtil = require('../util/model');

// HTML-RESPONSE CONTROLLER FUNCTIONS
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
    let profileId = req.query.profileId || req.session.userProfileId;

    try {
        let user = await req.data.user.populate('profiles');
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return exports.getProfiles(req, res, next);
        }

        if (profile.setupStage === 0){
            req.session.regProfileId = profile._id;

            return res.redirect('/profiles/languagesetup');
        }
        if (profile.setupStage === 1){
            req.session.regProfileId = profile._id;

            return res.redirect('/profiles/setup');
        }
        if (profile.setupStage === 2){
            req.session.userProfileId = profile._id;

            let imgSize = 300;

            let myList = [];
            for (let contentId of profile.list){
                let contentDoc = await modelUtil.findContentById(contentId, imgSize);
                if (contentDoc){
                    myList.push(contentDoc);
                }
            }

            let otherProfiles = user.profiles.filter(p => {
                return p._id.toString() !== profile._id.toString();
            });
            
            let content = {};

            let topContent;
            if (TMDB.mostPopular.length > 0){
                let mostPopularObj = TMDB.mostPopular.slice(-1)[0];
                topContent = mostPopularObj.content;
            } else {
                topContent = await TvShow.findOne({'category.name': 'most-popular'});
            }
            modelUtil.setImageSize('coverPath', topContent, 'original');
            modelUtil.setImageSize('backdropPath', topContent, 'original');

            content.topContent = topContent;

            let browseDataPath = 'data/browse.json';
            let dataString = await fileUtil.loadFile(browseDataPath);
            let browseData = JSON.parse(dataString);
            let categoriesList = browseData.categories;
            let footerNavList = browseData.footerNavList;

            let categories = [];
            for (let cat of categoriesList){
                let category = {};
                category.name = cat.categoryName;

                let model, queryFn, blockImgSize;
                let setImageSize = true;
                if (cat.modelName === 'Movie'){
                    model = Movie;
                    queryFn = Movie.find;
                } else if (cat.modelName === 'TvShow'){
                    model = TvShow;
                    queryFn = TvShow.find;
                } else {
                    queryFn = modelUtil.findContent;
                    setImageSize = false;
                    blockImgSize = imgSize;
                }

                let contentDocs = await queryFn.call(model, {
                    'categories.name': cat.TMDBCategory
                }, blockImgSize);
                if (setImageSize){
                    contentDocs.forEach(contentDoc => {
                        modelUtil.setImageSize('coverPath', contentDoc, imgSize);
                        modelUtil.setImageSize('backdropPath', contentDoc, imgSize);
                    })
                }

                category.contentDocs = contentDocs;
                categories.push(category);
                // console.log(category.name, '=>', category.contentDocs.length);
            }

            // content.categories1 = categories.slice(0, 2);
            // content.categories2 = categories.slice(2);
            content.categories = categories;

            return res.render('pages/content/browse', {
                pageTitle: 'Fleek',
                leadName: 'browse',
                profile: profile,
                otherProfiles: otherProfiles,
                content: content,
                myList: myList,
                navList: footerNavList,
            });
        }
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


        res.setHeader('Resource-Location', '/manageprofiles');

        res.render('pages/content/profiles', {
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
    let user = req.data.user;
    let profileId = req.body.profileId;
    let defaultLang = req.body.defaultLang;
    let otherLangs = [].concat(req.body.otherLang);

    try {
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
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
            doc.coverPath = TMDB.imageBaseUrl + '/w92' + doc.coverPath;
            return doc;
        });

        let authDataPath = 'data/auth.json';
        let authDataString = await fileUtil.loadFile(authDataPath);
        let authData = JSON.parse(authDataString);
        let navList = authData.footerNavList;

        res.render('pages/content/setup', {
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
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
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
    let profileId = req.query.profileId || req.session.userProfileId;

    try {
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return res.redirect('/manageprofiles');
        }

        return res.render('pages/content/edit-profile', {
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
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return res.redirect('/manageprofiles');
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
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return res.redirect('/manageprofiles');
        }

        return res.render('pages/content/delete-profile', {
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
    let profileId = req.query.profileId;

    try {
        let profile = await Profile.findById(profileId);
        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return res.redirect('/manageprofiles');
        }

        await profile.delete();

        let cleanedProfiles = user.profiles.filter((id) => {
            return id.toString() !== profileId.toString();
        });
        user.profiles = cleanedProfiles;
        await user.save();

        return res.redirect('/manageprofiles');
    } catch(error){
        next(error);
    }
};

// JSON-RESPONSE CONTROLLER FUNCTIONS
module.exports.postSwitchProfile = async (req, res, next) => {
    let profileId = req.body.profileId;

    try {
        let user = req.data.user;
        let profile = await Profile.findById(profileId);

        let isUserProfile;
        if (profile){
            isUserProfile = profile.user.toString() === user._id.toString();
        }
        if (!isUserProfile){
            return res.status(422).json({message: 'Invalid profile ID'});
        }

        req.session.userProfileId = profile._id;
        res.status(201).json({message: 'Profile switch successful'})
    } catch(error){
        error.data = { resType: 'application/json' };
        next(error);
    }
};

module.exports.getContent = async (req, res, next) => {
    let contentId = req.params.contentId;

    try {
        let imgSize = 185;
        let contentDoc = await modelUtil.findContentById(contentId, imgSize);

        if (!contentDoc){
            return res.status(404).json({
                message: 'content with matching id could not be found.'
            });
        }

        return res.status(200).json({ contentDoc: contentDoc });
    } catch(error){
        error.data = { resType: 'application/json' };
        next(error)
    }
};
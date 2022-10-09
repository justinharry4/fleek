const { Movie, TvShow } = require('./models');
const { tmdb } = require('../core/db');
const { getProfiles } = require('../profiles/controllers');
const contentUtil = require('./utils');
const fileUtil = require('../core/utils/file');
const { isUserProfile } = require('../profiles/utils');


// HTML-RESPONSE CONTROLLERS
module.exports.getBrowse = async (req, res, next) => {
    let profileId = req.query.profileId || req.session.userProfileId;

    let user = await req.data.user.populate('profiles');

    let profile = await isUserProfile(profileId, user);
    if (!profile){
        return getProfiles(req, res, next);
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

        let imageSize = 300;

        let myList = [];
        for (let contentId of profile.list){
            let contentDoc = await contentUtil.findContentById(contentId, imageSize);
            if (contentDoc){
                myList.push(contentDoc);
            }
        }

        let otherProfiles = user.profiles.filter(p => {
            return p._id.toString() !== profile._id.toString();
        });
        
        let content = {};

        let topContent;
        if (tmdb.mostPopular.length > 0){
            let mostPopularObj = tmdb.mostPopular.slice(-1)[0];
            topContent = mostPopularObj.content;
        } else {
            topContent = await TvShow.findOne({'category.name': 'most-popular'});
        }
        contentUtil.setImageSize('coverPath', topContent, 'original');
        contentUtil.setImageSize('backdropPath', topContent, 'original');

        content.topContent = topContent;

        let browseDataPath = 'content/data/browse.json';
        let dataString = await fileUtil.loadFile(browseDataPath);
        let browseData = JSON.parse(dataString);
        let categoriesList = browseData.categories;
        let footerNavList = browseData.footerNavList;

        let categories = [];
        for (let cat of categoriesList){
            let category = {};
            category.name = cat.categoryName;

            let model, queryFn, imgSize;
            let setImageSize = true;
            if (cat.modelName === 'Movie'){
                model = Movie;
                queryFn = Movie.find;
            } else if (cat.modelName === 'TvShow'){
                model = TvShow;
                queryFn = TvShow.find;
            } else {
                queryFn = contentUtil.findContent;
                setImageSize = false;
                imgSize = imageSize;
            }

            let contentDocs = await queryFn.call(model, {
                'categories.name': cat.tmdbCategory
            }, imgSize);

            if (setImageSize){
                contentDocs.forEach(contentDoc => {
                    contentUtil.setImageSize('coverPath', contentDoc, imageSize);
                    contentUtil.setImageSize('backdropPath', contentDoc, imageSize);
                });
            }

            category.contentDocs = contentDocs;
            categories.push(category);
            // console.log(category.name, '=>', category.contentDocs.length);
        }

        content.categories = categories;

        return res.render('content/browse', {
            pageTitle: 'Fleek',
            leadName: 'browse',
            profile: profile,
            otherProfiles: otherProfiles,
            content: content,
            myList: myList,
            navList: footerNavList,
        });
    }
};


// JSON-RESPONSE CONTROLLERS
module.exports.getContent = async (req, res, next) => {
    let contentId = req.params.contentId;

    let imageSize = 185;
    let contentDoc = await contentUtil.findContentById(contentId, imageSize);

    if (!contentDoc){
        return res.status(404).json({
            message: 'content with matching ID could not be found.'
        });
    }

    return res.status(200).json({ contentDoc: contentDoc });
};

exports.getContent.onError = (error, next) => {
    error.data = { resType: 'application/json' };
    next(error);
};
const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
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

module.exports.getCreateFirstMovie = async (req, res, next) => {
    let startTime = new Date();
    console.log('inside first movie controller');
    try {
        let tmdbConfigPath = 'reference_files/config.json';
        let tmdbConfigString = await fileUtil.loadFile(tmdbConfigPath);
        let tmdbConfig = JSON.parse(tmdbConfigString);

        let movieResPath = 'reference_files/movie2.json';
        let resString = await fileUtil.loadFile(movieResPath)
        let movieResData = JSON.parse(resString);

        let movieConfig =  tmdbUtil.getMovieConfig(movieResData, tmdbConfig);
        let firstMovie = new Movie(movieConfig);
        await firstMovie.save();

        res.json({message: 'some json response'})
        console.log('leaving movie controller...');

        let endTime = new Date();
        let totalSeconds = (endTime - startTime)/1000;
        console.log(`process completed in ${totalSeconds} seconds`);
    } catch (error){
        next(error);
    }
};

module.exports.getCreateFirstTvShow = async (req, res, next) => {
    let startTime = new Date();
    console.log('inside first tvshow controller...');
    try {
        let tmdbConfigPath = 'reference_files/config.json';
        let tmdbConfigString = await fileUtil.loadFile(tmdbConfigPath);
        let tmdbConfig = JSON.parse(tmdbConfigString);

        let tvResPath = 'reference_files/tv2.json';
        let resString = await fileUtil.loadFile(tvResPath)
        let tvResData = JSON.parse(resString);

        let tvConfig = await tmdbUtil.getTvShowConfig(tvResData, tmdbConfig);
        let firstTvShow = new TvShow(tvConfig);
        await firstTvShow.save();

        res.json({message: 'some other json message'});
        console.log('leaving tvshow controller...');
        
        let endTime = new Date();
        let totalSeconds = (endTime - startTime)/1000;
        console.log(`process completed in ${totalSeconds} seconds`);
    } catch(error){
        next(error);
    }
};

async function createMovie(){
    try {
        let tmdbConfigPath = 'reference_files/config.json';
        let tmdbConfigString = await fileUtil.loadFile(tmdbConfigPath);
        let tmdbConfig = JSON.parse(tmdbConfigString);

        let movieResPath = 'reference_files/movie.json';
        let resString = await fileUtil.loadFile(movieResPath)
        let movieResData = JSON.parse(resString);

        let config =  tmdbUtil.getMovieConfig(movieResData, tmdbConfig);
        let firstMovie = new Movie(config);
        await firstMovie.save();

        console.log('MOVIE CONFIG OBJECT', config);
    } catch (error){
        console.log('ERROR in createMovie', error);
    }
}

async function createTvShow(){
    try {
        let tmdbConfigPath = 'reference_files/config.json';
        let tmdbConfigString = await fileUtil.loadFile(tmdbConfigPath);
        let tmdbConfig = JSON.parse(tmdbConfigString);

        let tvResPath = 'reference_files/tv.json';
        let resString = await fileUtil.loadFile(tvResPath)
        let tvResData = JSON.parse(resString);

        let config = await tmdbUtil.getTvShowConfig(tvResData, tmdbConfig);
        let firstTvShow = new TvShow(config);
        await firstTvShow.save();

        console.log('TVSHOW CONFIG OBJECT', config);
    } catch (error){
        console.log('ERROR in createTvShow', error);
    }
}
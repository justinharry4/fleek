const dotenv = require('dotenv');
const axios = require('axios');

const fileUtil = require('../util/file');
const Season = require('../models/season');
const Episode = require('../models/episode');

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// function name suffixes FC and BC stand for
// FullContent and BlankContent respectively

function getMovieConfigFC(movieResData){
    let config = {};

    config.title = movieResData.title;
    config.overview = movieResData.overview;
    config.genres = movieResData.genres.map(genre => genre.name);

    config.releaseDate = movieResData['release_date'];
    config.releaseYear = movieResData['release_date'].split('-')[0];
    config.durationMins = movieResData.runtime;
    
    let productionCountry = movieResData['production_countries'][0];
    config.country = productionCountry.name;
    config.countryCode = productionCountry['iso_3166_1'];

    config.languages = movieResData['spoken_languages'].map(lang => lang['english_name']);

    config.starRating = movieResData['vote_average'];
    config.popularity = movieResData.popularity;

    config.releaseStatus = movieResData.status;
    config.productionCompanies = movieResData['production_companies'].map(comp => comp.name);

    let networks = movieResData.networks;
    config.networks = networks ? networks.map(ntwk => ntwk.name): [];

    config.coverPath = movieResData['poster_path'];
    config.videoPath = '/somevideopath.mkv';

    config.isFullContent = true;

    return config;
}

async function getTvShowConfigFC(tvResData){
    let config = {};

    config.title = tvResData.name;
    config.overview = tvResData.overview;
    config.seasonCount = tvResData['number_of_seasons'];
    config.episodeCount = tvResData['number_of_episodes'];
    config.genres = tvResData.genres.map(genre => genre.name);

    config.firstAirDate = tvResData['first_air_date'];
    config.firstAirYear = tvResData['first_air_date'].split('-')[0];
    config.lastAirDate = tvResData['last_air_date'];
    config.avgDurationMins = tvResData['episode_run_time'];
    
    let productionCountry = tvResData['production_countries'][0];
    config.country = productionCountry.name;
    config.countryCode = productionCountry['iso_3166_1'];

    config.languages = tvResData['spoken_languages'].map(lang => lang['english_name']);

    config.starRating = tvResData['vote_average'];
    config.popularity = tvResData.popularity;

    config.tvShowStatus = tvResData.status;
    config.productionCompanies = tvResData['production_companies'].map(comp => comp.name);

    let networks = movieResData.networks;
    config.networks = networks ? networks.map(ntwk => ntwk.name): [];

    config.coverPath = tvResData['poster_path'];

    let tvShowData = { 
        tvShowTitle: config.title,
        tvShowID: tvResData.id,
    }
    try {
        let seasons = [];
        for (let seasonData of tvResData.seasons){
            let seasonConfig = await getSeasonConfig(seasonData, tvShowData);
            let season = new Season(seasonConfig);
            await season.save();
            seasons.push(season._id);
        }
        config.seasons = seasons;

        let latestSeasonId = config.seasons[config.seasons.length - 1];
        let latestSeason = await Season.findById(latestSeasonId);
        let latestEpisode = latestSeason.episodes[latestSeason.episodes.length - 1];
        config.latestEpisode = latestEpisode;
        // config.latestEpisode = latestSeasonId;  
        config.isFullContent = true;

        return config;
    } catch(error){
        console.log('An error occured in getTvShowConfig', error);
        throw new Error(error);
    }
}

async function getSeasonConfig(seasonData, tvShowData){
    let config = {};

    config.tvShowTitle = tvShowData.tvShowTitle;
    config.seasonNo = seasonData['season_number'];
    config.overview = seasonData.overview;
    config.episodeCount = seasonData['episode_count'];
    config.airDate = seasonData['air_date'];

    config.coverPath = seasonData['poster_path'];

    let tvShowID = tvShowData.tvShowID;
    let url = `${TMDB_API_BASE_URL}/tv/${tvShowID}/season/${config.seasonNo}`;
    try {
        let response = await axios.get(url, {
            params: {
                api_key: TMDB_API_KEY
            }
        })

        let seasonDetail = response.data;
        let episodes = [];
        for (let episodeData of seasonDetail.episodes){
            let episodeConfig = getEpisodeConfig(episodeData, tvShowData)
            let episode = new Episode(episodeConfig);
            await episode.save();
            episodes.push(episode._id);
        }
        config.episodes = episodes;

        return config;
    } catch (error){
        console.log('An Error occured in getSeasonConfig', error);
        throw new Error(error);
    }
}

function getEpisodeConfig(episodeData, tvShowData){
    let config = {};

    config.title = episodeData.name;
    config.tvShowTitle = tvShowData.tvShowTitle;
    config.episodeNo = episodeData['episode_number'];
    config.seasonNo = episodeData['season_number'];
    config.overview = episodeData.overview;
    config.durationMins = episodeData.runtime;
    config.airDate = episodeData['air_date'];

    config.stillImagePath = episodeData['still_path'];

    config.videoPath = '/somevideopath.m4v';
    
    return config;
}

function getMovieConfigBC(movieResData, tmdbGenres){
    let config = {};

    config.title = movieResData.title;
    config.overview = movieResData.overview;

    config.genres = movieResData['genre_ids'].map(genreId => {
        let genreObj = tmdbGenres.genres.find(genre => (genre.id === genreId));
        return genreObj.name;
    });

    config.releaseDate = movieResData['release_date'];
    config.releaseYear = movieResData['release_date'].split('-')[0];

    config.languages = movieResData['original_language'];

    config.starRating = movieResData['vote_average'];
    config.popularity = movieResData.popularity;

    config.coverPath = movieResData['poster_path'];

    return config;
}

function getTvShowConfigBC(tvResData, tmdbGenres){
    let config = {};

    config.title = tvResData.name;
    config.overview = tvResData.overview;
    
    config.genres = movieResData['genre_ids'].map(genreId => {
        let genreObj = tmdbGenres.genres.find(genre => (genre.id === genreId));
        return genreObj.name;
    });

    config.firstAirDate = tvResData['first_air_date'];
    config.firstAirYear = tvResData['first_air_date'].split('-')[0];

    config.starRating = tvResData['vote_average'];
    config.popularity = tvResData.popularity;
    config.coverPath = tvResData['poster_path'];
    
    return config;
}

module.exports.getMovieConfigFC = getMovieConfigFC;
module.exports.getTvShowConfigFC = getTvShowConfigFC;

module.exports.getMovieConfigBC = getMovieConfigBC;
module.exports.getTvShowConfigBC = getTvShowConfigBC;

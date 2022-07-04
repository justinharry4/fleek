const dotenv = require('dotenv');
const axios = require('axios');

const fileUtil = require('../util/file');
const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const Season = require('../models/season');
const Episode = require('../models/episode');

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// function name suffixes FC and BC stand for
// FullContent and BlankContent respectively

function getMovieConfigFC(movieResData, tmdbConfig){
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

    let baseImageUrl = tmdbConfig.images['secure_base_url'];
    let imageSize = 'original';
    let imagePath = movieResData['poster_path'];
    config.coverPath = baseImageUrl + imageSize + imagePath;

    config.videoPath = '/somevideopath.mkv';

    return config;
}

async function getTvShowConfigFC(tvResData, tmdbConfig){
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

    let baseImageUrl = tmdbConfig.images['secure_base_url'];
    let imageSize = 'original';
    let imagePath = tvResData['poster_path'];
    config.coverPath = baseImageUrl + imageSize + imagePath;

    let tvShowData = { 
        tvShowTitle: config.title,
        tvShowID: tvResData.id,
        tmdbConfig: tmdbConfig
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

    let baseImageUrl = tvShowData.tmdbConfig.images['secure_base_url'];
    let imageSize = 'original';
    let imagePath = seasonData['poster_path'];
    config.coverPath = baseImageUrl + imageSize + imagePath;

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

    let baseImageUrl = tvShowData.tmdbConfig.images['secure_base_url'];
    let imageSize = 'original';
    let imagePath = episodeData['still_path'];
    config.stillImagePath = baseImageUrl + imageSize + imagePath;

    config.videoPath = '/somevideopath.m4v';
    
    return config;
}

module.exports.getMovieConfig = getMovieConfigFC;
module.exports.getTvShowConfig = getTvShowConfigFC;
const axios = require('axios');
const cheerio = require('cheerio');

const config = require('../config/config');
const { Season, Episode } = require('./models');
const { lowerCaseHyphenate } = require('../core/utils/misc');
const { isFullyOpaque } = require('../core/utils/image');

const TMDB_API_KEY = config.TMDB_API_KEY;
const tmdbAPIBaseUrl = 'https://api.themoviedb.org/3';
const tmdbMainBaseUrl = 'https://www.themoviedb.org';

// function name suffixes FC and BC stand for
// FullContent and BlankContent respectively

async function getMovieConfigFC(movieResData){
    let config = {};

    config.title = movieResData.title;
    config.overview = movieResData.overview;
    config.genres = movieResData.genres.map(genre => genre.name);

    config.releaseDate = movieResData.release_date;
    config.releaseYear = movieResData.release_date.split('-')[0];
    config.durationMins = movieResData.runtime;
    
    let productionCountry = movieResData.production_countries[0];
    config.country = (productionCountry) ? productionCountry.name : undefined;
    config.countryCode = (productionCountry) ? productionCountry.iso_3166_1 : undefined;

    config.language = movieResData.original_language;
    config.spokenLanguages = movieResData.spoken_languages.map(lang => lang.english_name);

    config.starRating = movieResData.vote_average;
    config.popularity = movieResData.popularity;

    config.releaseStatus = movieResData.status;
    config.productionCompanies = movieResData.production_companies.map(comp => comp.name);

    let networks = movieResData.networks;
    config.networks = networks ? networks.map(ntwk => ntwk.name): [];

    config.coverPath = movieResData.poster_path;
    config.videoPath = '/somevideopath.mkv';
    config.backdropPath = movieResData.backdrop_path;

    let contentData = {
        id: movieResData.id,
        title: movieResData.title,
        type: 'movie'
    }
    config.logoURL = await getContentLogoURL(contentData);
    // console.log('backdrop =>', config.backdropPath);
    // console.log('logo =>', config.logoURL);

    config.isFullContent = true;

    return config;
}

async function getTvShowConfigFC(tvResData){
    let config = {};

    config.title = tvResData.name;
    config.overview = tvResData.overview;
    config.seasonCount = tvResData.number_of_seasons;
    config.episodeCount = tvResData.number_of_episodes;
    config.genres = tvResData.genres.map(genre => genre.name);

    config.firstAirDate = tvResData.first_air_date;
    config.firstAirYear = tvResData.first_air_date.split('-')[0];
    config.lastAirDate = tvResData.last_air_date;
    config.avgDurationMins = tvResData.episode_run_time;
    
    let productionCountry = tvResData.production_countries[0];
    config.country = (productionCountry) ? productionCountry.name : undefined;
    config.countryCode = (productionCountry) ? productionCountry.iso_3166_1 : undefined;

    config.language = tvResData.original_language;
    config.spokenLanguages = tvResData.spoken_languages.map(lang => lang.english_name);

    config.starRating = tvResData.vote_average;
    config.popularity = tvResData.popularity; 

    config.tvShowStatus = tvResData.status;
    config.productionCompanies = tvResData.production_companies.map(comp => comp.name);

    let networks = tvResData.networks;
    config.networks = networks ? networks.map(ntwk => ntwk.name): [];

    config.coverPath = tvResData.poster_path;
    config.backdropPath = tvResData.backdrop_path;

    let contentData = {
        id: tvResData.id,
        title: tvResData.name,
        type: 'tv'
    }
    config.logoURL = await getContentLogoURL(contentData);

    let tvShowData = { 
        tvShowTitle: config.title,
        tvShowID: tvResData.id,
    }
    try {
        let seasons = [];
        for (let seasonData of tvResData.seasons){
            if (seasonData.season_number < 1){
                continue;
            }
            let query = { 
                tvShowTitle: tvShowData.tvShowTitle,
                seasonNo: seasonData.season_number,
                episodeCount: seasonData.episode_count,
                airDate: seasonData.air_date
            }
            let existingSeasons = await Season.find(query);
            if (existingSeasons.length === 0){
                let seasonConfig = await getSeasonConfig(seasonData, tvShowData);
                let season = new Season(seasonConfig);
                await season.save();
                seasons.push(season._id);
            } else {
                let season = existingSeasons[0];
                seasons.push(season._id);
            }
        }
        config.seasons = seasons;

        let latestEpisode;
        let reverseSeasons = seasons.slice(0).reverse();
        let latestEpisodeFound = false;
        for (let seasonId of reverseSeasons){
            if (latestEpisodeFound){
                break;
            }
            let season = await Season.findById(seasonId);
            let reverseEpisodes = season.episodes.slice(0).reverse();
            for (let episodeId of reverseEpisodes){
                let episode = await Episode.findById(episodeId);
                if (episode.releaseStatus === 'released'){
                    latestEpisode = episode._id;
                    latestEpisodeFound = true;
                    break;
                }
            }
        }
        config.latestEpisode = latestEpisode;

        config.isFullContent = true;

        return config;
    } catch(error) {
        console.log('An error occured in getTvShowConfig', error);
        throw new Error(error);
    }
}

async function getSeasonConfig(seasonData, tvShowData){
    let config = {};

    config.tvShowTitle = tvShowData.tvShowTitle;
    config.seasonNo = seasonData.season_number;
    config.overview = seasonData.overview;
    config.episodeCount = seasonData.episode_count;
    config.airDate = seasonData.air_date;

    config.coverPath = seasonData.poster_path;

    let tvShowID = tvShowData.tvShowID;
    let url = `${tmdbAPIBaseUrl}/tv/${tvShowID}/season/${config.seasonNo}`;
    let queryParams = { api_key: TMDB_API_KEY };
    try {
        let response = await axios.get(url, { params: queryParams });

        let seasonDetail = response.data;
        let episodes = [];
        for (let episodeData of seasonDetail.episodes){
            let query = {
                tvshowTitle: tvShowData.tvShowTitle,
                title: episodeData.name,
                episodeNo: episodeData.episode_number,
                seasonNo: episodeData.season_number,
                airDate: episodeData.air_date
            };
            let existingEpisodes = await Episode.find(query);
            if (existingEpisodes.length === 0){
                let episodeConfig = getEpisodeConfig(episodeData, tvShowData)
                let episode = new Episode(episodeConfig);
                await episode.save();
                episodes.push(episode._id);
            } else {
                let episode = existingEpisodes[0];
                episodes.push(episode._id)
            }
        }
        config.episodes = episodes;

        let currentDate = new Date();
        let [sAirYear, sAirMonth, sAirDay] = config.airDate.split('-').map(str => parseInt(str));
        let sAirDate = new Date(Date.UTC(sAirYear, sAirMonth-1, sAirDay));

        let lastEpisodeId = config.episodes.slice(-1)[0];
        let lastEpisode = await Episode.findById(lastEpisodeId);
        let [eAirYear, eAirMonth, eAirDay] = lastEpisode.airDate.split('-').map(str => parseInt(str));
        let eAirDate = new Date(Date.UTC(eAirYear, eAirMonth-1, eAirDay));

        let status;
        if (currentDate < sAirDate){
            status = 'unreleased';
        } else if (currentDate < eAirDate){
            status = 'on-air';
        } else {
            status = 'released';
        }
        config.releaseStatus = status;

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
    config.episodeNo = episodeData.episode_number;
    config.seasonNo = episodeData.season_number;
    config.overview = episodeData.overview;
    config.durationMins = episodeData.runtime;
    config.airDate = episodeData.air_date;

    let status;
    let currentDate = new Date();
    let [airYear, airMonth, airDay] = config.airDate.split('-').map(str => parseInt(str));
    let airDate = new Date(Date.UTC(airYear, airMonth-1, airDay));
    if (currentDate >= airDate){
        status = 'released';
    } else {
        status = 'unreleased';
    }
    config.releaseStatus = status;

    config.stillImagePath = episodeData.still_path;
    config.videoPath = '/somevideopath.m4v';
    
    return config;
}

async function getMovieConfigBC(movieResData, tmdbGenres){
    let config = {};

    config.title = movieResData.title;
    config.overview = movieResData.overview;

    config.genres = movieResData.genre_ids.map(genreId => {
        let genreObj = tmdbGenres.find(genre => (genre.id === genreId));
        return genreObj.name;
    });

    config.releaseDate = movieResData.release_date;
    config.releaseYear = movieResData.release_date.split('-')[0];

    config.language = movieResData.original_language;

    config.starRating = movieResData.vote_average;
    config.popularity = movieResData.popularity;

    config.coverPath = movieResData.poster_path;
    config.backdropPath = movieResData.backdrop_path;

    let contentData = {
        id: movieResData.id,
        title: movieResData.title,
        type: 'movie'
    }
    config.logoURL = await getContentLogoURL(contentData);
    // console.log('backdrop =>', config.backdropPath);
    // console.log('logo =>', config.logoURL);

    config.isFullContent = false;

    return config;
}

async function getTvShowConfigBC(tvResData, tmdbGenres){
    let config = {};

    config.title = tvResData.name;
    config.overview = tvResData.overview;
    
    config.genres = tvResData.genre_ids.map(genreId => {
        let genreObj = tmdbGenres.find(genre => (genre.id === genreId));
        return genreObj.name;
    });

    config.firstAirDate = tvResData.first_air_date;
    config.firstAirYear = tvResData.first_air_date.split('-')[0];

    config.language = tvResData.original_language;

    config.starRating = tvResData.vote_average;
    config.popularity = tvResData.popularity;

    config.coverPath = tvResData.poster_path;
    config.backdropPath = tvResData.backdrop_path;

    let contentData = {
        id: tvResData.id,
        title: tvResData.name,
        type: 'tv'
    }
    config.logoURL = await getContentLogoURL(contentData);
    
    config.isFullContent = false;

    return config;
}

async function getContentLogoURL(contentData){
    let type = contentData.type;
    let id = contentData.id;
    let title = lowerCaseHyphenate(contentData.title);

    let url = tmdbMainBaseUrl + `/${type}/${id}-${title}/images/logos`;

    try {
        let response = await axios.get(url);
        let $ = cheerio.load(response.data);

        let selector = 'ul.images.logos div.image_content a[title="View Original"] img';
        let $imgElements = $(selector);
        
        let source;
        for (let imgElement of $imgElements){
            let src = $(imgElement).attr('src');

            if (src){
                let absURL = tmdbMainBaseUrl + src;
                let isOpaque = await isFullyOpaque(absURL);
                if (!isOpaque){
                    source = absURL;
                    break;
                }
            }
        }

        let logoURL = source || 'No Logo Available';

        return logoURL;
    } catch(error){
        console.log('An error occured in getContentLogoURL', error);
        throw error;
    }
}


module.exports = {
    getMovieConfigFC,
    getMovieConfigBC,
    getTvShowConfigFC,
    getTvShowConfigBC,
}
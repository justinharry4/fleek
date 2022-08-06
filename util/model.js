const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');

const TMDB = require('../database/tmdb');

async function findContentGeneric(functionName, arg, imgSize="original"){
    try {
        let movies = await Movie[functionName](arg);
        movies = [].concat(movies)
        for (let movie of movies){
            if (movie){
                setCoverImageSize(movie, imgSize);
            }
        }

        let tvshows = await TvShow[functionName](arg);
        tvshows = [].concat(tvshows);
        for (let tvshow of tvshows){
            if (tvshow){
                setCoverImageSize(tvshow, imgSize);
            }
        }

        return { movies: movies, tvshows: tvshows }
    } catch(error){
        throw error;
    }
}

function setCoverImageSize(contentDoc, imgSize){
    if (!contentDoc){
        throw new Error('A valid content document must be passed.');
    }
    if (imgSize && (!isNaN(Number(imgSize)) || imgSize === 'original' )){
        let sizePrefix = imgSize === 'original' ? '/' : '/w'
        contentDoc.coverPath = TMDB.imageBaseUrl + sizePrefix +
                               imgSize + contentDoc.coverPath;
    } else {
        throw new Error('Invalid image size selected. Got ' + imgSize);
    }
}

async function findContentById(id, imgSize){
    try {
        let result = await findContentGeneric('findById', id, imgSize);

        let contentDoc = null;
        for (let key in result){
            if (result[key][0]){
                contentDoc = result[key][0];
                break;
            }
        }

        return contentDoc;
    } catch(error){
        throw error;
    }
}

async function findContent(query, imgSize){
    try {
        let result = await findContentGeneric('find', query, imgSize);
        let resultList = result.movies.concat(result.tvshows);

        return resultList;
    } catch(error){
        throw error;
    }
}

async function findOneContent(query, imgSize){
    try {
        let result = await findContentGeneric('findOne', query, imgSize);
        let fullResult = result.movies.concat(result.tvshows);
        let singleResult = fullResult[0] ? fullResult[0] : null;

        return singleResult;
    } catch(error){
        throw error;
    }
}

module.exports.findContentById = findContentById;

module.exports.findContent = findContent;

module.exports.findOneContent = findOneContent;

module.exports.setCoverImageSize = setCoverImageSize;
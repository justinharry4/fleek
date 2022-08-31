const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');

const TMDB = require('../database/tmdb');

const backdropSizes = [300, 780, 1280, 'original'];
const coverSizes = [92, 154, 185, 342, 500, 780, 'original'];

async function findContentGeneric(functionName, arg, imgSize="original"){
    try {
        let movies = await Movie[functionName](arg);
        movies = [].concat(movies)
        for (let movie of movies){
            if (movie){
                setImageSize('coverPath', movie, imgSize);
                setImageSize('backdropPath', movie, imgSize)
            }
        }

        let tvshows = await TvShow[functionName](arg);
        tvshows = [].concat(tvshows);
        for (let tvshow of tvshows){
            if (tvshow){
                setImageSize('coverPath', tvshow, imgSize);
                setImageSize('backdropPath', tvshow, imgSize);
            }
        }

        return { movies: movies, tvshows: tvshows }
    } catch(error){
        throw error;
    }
}

function setImageSize(imageProperties, contentDoc, imgSize){
    if (!contentDoc){
        throw new Error('A valid content document must be passed.');
    }

    let validProperties = ['coverPath', 'backdropPath'];
    let propertyNames;
    if (imageProperties === ''){
        propertyNames = validProperties;
    } else {
        propertyNames = [].concat(imageProperties);
    }

    if (imgSize && ( !isNaN(Number(imgSize)) || imgSize === 'original' )){
        let sizePrefix = imgSize === 'original' ? '/' : '/w';

        for (let property of propertyNames){
            if (!validProperties.includes(property)){
                throw new Error('Invalid property name. Got ' + property);
            }

            if (imgSize !== 'original'){
                let sizes;
                if (property === 'coverPath'){
                    sizes = coverSizes.slice(0, -1);
                }
                if (property === 'backdropPath'){
                    sizes = backdropSizes.slice(0, -1);
                }

                let closestSize;
                let targetSize = parseInt(imgSize);
                for (let size of sizes){
                    if (closestSize){
                        let diff = Math.abs(targetSize - size);
                        let currentDiff = Math.abs(targetSize - closestSize);
                        if (diff < currentDiff){
                            closestSize = size;
                        }
                    } else {
                        closestSize = size;
                    }
                }
                
                imgSize = closestSize;
            }

            contentDoc[property] = TMDB.imageBaseUrl
                                + sizePrefix 
                                + imgSize
                                + contentDoc[property];
        }
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

async function clearOldData(){
    console.log('clearing database');

    let movieCount = 0;
    let totalMovies = await Movie.find().count()
    let movies = await Movie.find();
    for (let movie of movies){
        if (!movie.backdropPath){
            await movie.delete();
            movieCount += 1
        }
    }
    let tvCount = 0;
    let totaltvs = await TvShow.find().count();
    let tvs = await TvShow.find();
    for (let tv of tvs){
        if (!tv.backdropPath){
            await tv.delete();
            tvCount += 1;
        }
    }

    console.log('mvtotal='+totalMovies, 'tvtotal='+totaltvs);
    console.log('movieCount =', movieCount);
    console.log('tvCount =', tvCount);

    console.log('database cleared');
}

module.exports.findContentById = findContentById;

module.exports.findContent = findContent;

module.exports.findOneContent = findOneContent;

module.exports.setImageSize = setImageSize;



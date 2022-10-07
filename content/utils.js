const { Movie, TvShow } = require('./models');
const tmdb = require('./tmdb');

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

    if (imgSize && ( !isNaN(Number(imgSize)) || imgSize === 'original' )){
        let sizePrefix = (imgSize === 'original') ? '/' : '/w';

        let propertyNames;
        if (imageProperties === ''){
            propertyNames = validProperties;
        } else {
            propertyNames = [].concat(imageProperties);
        }

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

            contentDoc[property] = (
                tmdb.imageBaseUrl +
                sizePrefix +
                imgSize +
                contentDoc[property]
            );
        }
    } else {
        throw new Error('Invalid image size provided. Got ' + imgSize);
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

module.exports = {
    findContentById,
    findContent,
    findOneContent,
    setImageSize,
}

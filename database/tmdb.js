const axios = require('axios');
const mongoose = require('mongoose');

const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const configUtil = require('../util/config');
const fileUtil = require('../util/file');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

class TheMovieDB {
    constructor(apiKey){
        this.key = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
    
        this.movieProps = {
            constructor: Movie,
            configGenFC: configUtil.getMovieConfigFC,
            configGenBC: configUtil.getMovieConfigBC,
        };
        this.tvProps = {
            constructor: TvShow,
            configGenFC: configUtil.getTvShowConfigFC,
            configGenBC: configUtil.getTvShowConfigBC,
        }
        this.mostPopular = [];    // [ {index: 0, type: 'tv', contentDoc: {_id: ...}}] maxlength = 2
        this._loadGenres();
    }
    
    async _loadGenres(){
        try {
            let movieGenresPath = 'data/tmdb/movie-genres.json';
            let movieGenresStr = await fileUtil.loadFile(movieGenresPath);
            let movieGenres = JSON.parse(movieGenresStr);

            let tvGenresPath = 'data/tmdb/tv-genres.json';
            let tvGenresStr = await fileUtil.loadFile(tvGenresPath);
            let tvGenres = JSON.parse(tvGenresStr);

            this.movieProps.genres = movieGenres;
            this.tvProps.genres = tvGenres;
        } catch(error){
            console.log('ERR in loadGenres', error);
            throw new Error(error);
        }
    }

    async writeMostPopular(){
        let mostPopular = this.mostPopular;
        let type;
        if (mostPopular.length === 0){
            type = 'movie';
        } else {
            let currentMp = mostPopular.slice(-1)[0];
            type = (currentMp.type === 'movie') ? 'tv': 'movie';
        }
        let props = (type === 'movie') ? this.movieProps: this.tvProps;
        let url = this.baseUrl + '/' + type + '/popular';

        try {
            let response = await axios.get(url, {
                params: {
                    api_key: TMDB_API_KEY
                }
            });
            let fullResData = response.data
            let relevantResults = fullResData.results.slice(0, 5);
            
            let newIndex;
            if (mostPopular.length > 1){
                let prevMp = mostPopular.find(mp => mp.type === type);
                let prevIndex = prevMp.index;
                newIndex = prevIndex < 4 ? prevIndex + 1 : 0;
            } else {
                newIndex = 0;
            }
            
            let resData = relevantResults[newIndex];
            let resTitle = resData.title || resData.name;
            let resDate = resData.release_date || resData.first_air_date;
            let docDate = (type === 'movie') ? 'releaseDate' : 'fisrtAirDate';
            let query = {};
            query.title = resTitle;
            query[docDate] = resDate;
        
            let newMostPopular;
            let newMpContentDoc;
            let contentDocs = await props.constructor.find(query);
            if (contentDocs.length === 0){
                while (!props.genres){
                    continue;
                }
                let config = props.configGenBC(resData, props.genres);
                newMpContentDoc = new props.constructor(config);
                newMpContentDoc.categories.push = 'most-popular';
                await newMpContentDoc.save();
            } else {
                newMpContentDoc = contentDocs[0];
                if (!newMpContentDoc.categories.includes('most-popular')){
                    newMpContentDoc.categories.push('most-popular');
                    await newMpContentDoc.save();
                }
            }
            newMostPopular = {
                index: newIndex,
                type: type,
                contentDoc: newMpContentDoc
            }
            if (this.mostPopular.length > 1){
                this.mostPopular.shift();
            }
            this.mostPopular.push(newMostPopular);

            return newMostPopular.contentDoc;
        } catch (error){
            console.log('writeMostPopular Error', error);
            throw new Error(error);
        }
    }

    writeRecentlyAdded(){
        let FCCount = 6;
        let BCCount = 9;
        
    }

    _isEqual(resData, contentDoc){
        let sameName;
        if (resData.title){
            sameName = resData.title === contentDoc.title;
        } else {
            sameName = resData.name === contentDoc.title;
        }

        let sameReleaseDate;
        if (resData.release_date){
            sameReleaseDate = resData.release_date === contentDoc.releaseDate;
        } else {
            sameReleaseDate = resData.first_air_date === contentDoc.firstAirDate;
        }

        return sameName && sameReleaseDate;
    }
}

module.exports = TheMovieDB;

// testFunc();

// function letter(a){
//     let x = 'XXIV';
//     a.toString();
//     return a;
// }

// async function test(){
//     try {
//         let result = await letter()
//         console.log(result);
//     } catch(error){
//         console.log('ERR', error)
//     }
// }

// test()

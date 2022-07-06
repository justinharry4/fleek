const axios = require('axios');
const mongoose = require('mongoose');

const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const configUtil = require('../util/config');
const fileUtil = require('../util/file');

class TheMovieDB {
    constructor(apiKey){
        this.key = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
    
        this.movieProps = {
            constructor: Movie,
            getConfigFC: configUtil.getMovieConfigFC,
            getConfigBC: configUtil.getMovieConfigBC,
        };
        this.tvProps = {
            constructor: TvShow,
            getConfigFC: configUtil.getTvShowConfigFC,
            getConfigBC: configUtil.getTvShowConfigBC,
        }
        this.mostPopular = [];    // [ {index: 0, type: 'tv', contentDoc: {_id: ...}}] maxlength = 2
        this._addTimeProperty();
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

    _addTimeProperty(){
        let time = {}

        time.MILLI_SECOND = 1;
        time.SECOND = 1000;
        time.MINUTE = 60 * time.SECOND;
        time.HOUR = 60 * time.MINUTE;
        time.DAY = 24 * time.HOUR;
        time.WEEK = 7 * time.DAY;
        time.MONTH = 30 * time.DAY;
        time.YEAR = 365 * time.DAY;

        this.time = time;
    }
    async sendGetRequest(url){
        try {
            let response = await axios.get(url, {
                params: {
                    api_key: this.key
                }
            });
            return response;
        } catch (error){
            console.log('REQUEST FAILED', error);
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
                    api_key: this.key
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
            
            let validDuration = 1 * this.time.DAY
            let currentDate = new Date();
            let expiryDateMs = currentDate.valueOf() + validDuration; 
            let expiryDate = new Date(expiryDateMs);
            let category = { name: 'most-popular', expiryDate: expiryDate }

            let newMostPopular;
            let newMpContentDoc;
            let contentDocs = await props.constructor.find(query);
            if (contentDocs.length === 0){
                while (!props.genres){
                    continue;
                }
                let config = props.getConfigBC(resData, props.genres);
                newMpContentDoc = new props.constructor(config);
                newMpContentDoc.categories.push(category)
                await newMpContentDoc.save();
            } else {
                newMpContentDoc = contentDocs[0];
                let existingCategory = newMpContentDoc.categories.find(cat => {
                    return cat.name === 'most-popular';
                })
                if (!existingCategory){
                    newMpContentDoc.categories.push(category);
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

    async writeRecentlyAdded(){
        let [movieFCCount, movieBCCount] = [3, 5];
        let [tvFCCount, tvBCCount] = [3, 4];

        let validDuration = 1 * this.time.HOUR
        let currentDate = new Date();
        let expiryDateMs = currentDate.valueOf() + validDuration; 
        let expiryDate = new Date(expiryDateMs);
        let category = { name: 'recently-added', expiryDate: expiryDate }
        
        try {
            let latestMovieUrl = this.baseUrl + '/movie/now_playing';
            let movieResponse = await this.sendGetRequest(latestMovieUrl);
            let fullResMovieData = movieResponse.data;
            let movieCount = movieFCCount + movieBCCount;
            let relevantMovieResults = fullResMovieData.results.slice(0, movieCount);

            for (let [index, resData] of relevantMovieResults.entries()){
                let getMovieConfig;
                let fullContent;
                if (index < movieFCCount){
                    let movieDetailUrl = this.baseUrl + '/movie/' + resData.id;
                    let response = await this.sendGetRequest(movieDetailUrl);
                    resData = response.data;
                    getMovieConfig = configUtil.getMovieConfigFC;
                    fullContent = true;
                } else {
                    getMovieConfig = configUtil.getMovieConfigBC;
                    fullContent = false;
                }
                console.log('movie iteration', index);
                let movies = await Movie.find({
                    title: resData.title,
                    releaseDate: resData.release_date,
                    isFullContent: fullContent
                })
                if (movies.length === 0){
                    while (!this.movieProps.genres){
                        continue;
                    }
                    let config = getMovieConfig(resData, this.movieProps.genres);
                    let newMovie = new Movie(config);
                    newMovie.categories.push(category);
                    await newMovie.save();
                } else {
                    let movie = movies[0];
                    let exisitingCategory = movie.categories.find(cat => {
                        return cat.name === 'recently-added';
                    })
                    if (!exisitingCategory){
                        movie.categories.push(category);
                        await movie.save();
                    }
                }
            }
        } catch (error){
            console.log('ERR! writing recent movies failed.', error);
            throw new Error(error);
        }

        try {
            let latestTvUrl = this.baseUrl + '/tv/on_the_air';
            let tvResponse = await this.sendGetRequest(latestTvUrl);
            let fullResTvData = tvResponse.data;
            let tvCount = tvFCCount + tvBCCount;
            let relevantTvResults = fullResTvData.results.slice(0, tvCount);

            for (let [index, resData] of relevantTvResults.entries()){
                let getTvConfig;
                let fullContent;
                if (index < tvFCCount){
                    let tvDetailUrl = this.baseUrl + '/tv/' + resData.id;
                    let response = await this.sendGetRequest(tvDetailUrl);
                    resData = response.data;
                    getTvConfig = configUtil.getTvShowConfigFC;
                    fullContent = true;
                } else {
                    getTvConfig = configUtil.getTvShowConfigBC;
                    fullContent = false;
                }
                console.log('tv iteration', index);
                let tvShows = await TvShow.find({
                    title: resData.name,
                    firstAirDate: resData.first_air_date,
                    isFullContent: fullContent
                })
                if (tvShows.length === 0){
                    while (!this.tvProps.genres){
                        continue;
                    }
                    let config;
                    if (fullContent){
                        config = await getTvConfig(resData);
                    } else {
                        config = getTvConfig(resData, this.tvProps.genres);
                    }
                    let newTvShow = new TvShow(config);
                    newTvShow.categories.push(category);
                    await newTvShow.save();
                } else {
                    let tvShow = tvShows[0];
                    let existingCategory = tvShow.categories.find(cat => {
                        return cat.name === 'recently-added';
                    })
                    if (!existingCategory){
                        tvShow.categories.push(category);
                        await tvShow.save();
                    }
                }
            }
        } catch (error){
            console.log('ERR! writing recent tvshows failed.', error);
            throw new Error(error);
        }
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

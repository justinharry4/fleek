const axios = require('axios');
const mongoose = require('mongoose');

const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');
const configUtil = require('../util/config');
const fileUtil = require('../util/file');

class TheMovieDB {
    constructor(apiKey){
        if (!apiKey){
            throw new Error('API Key is required to initialize TMDB');
        }
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
        this.availableCategories = [
            'most-popular',
            'recently-added',
            'trending',
            'tv-drama',
        ]
        this.mostPopular = [];    // [ {index: 0, type: 'tv', contentDoc: {_id: ...}}] maxlength = 2
        this._addTimeProperty();
    }
    
    async _loadGenres(){
        if (!this.movieProps.genres || !this.tvProps.genres){
            try {
                let movieGenresPath = 'data/tmdb/movie-genres.json';
                let movieGenresStr = await fileUtil.loadFile(movieGenresPath);
                let movieGenres = JSON.parse(movieGenresStr);

                let tvGenresPath = 'data/tmdb/tv-genres.json';
                let tvGenresStr = await fileUtil.loadFile(tvGenresPath);
                let tvGenres = JSON.parse(tvGenresStr);

                this.movieProps.genres = movieGenres.genres;
                this.tvProps.genres = tvGenres.genres;
            } catch(error){
                console.log('ERR in loadGenres', error);
                throw new Error(error);
            }
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

    async sendGetRequest(url, queryParams){
        let qParams = { api_key: this.key, ...queryParams }
        try {
            let response = await axios.get(url, {
                params: qParams
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
                await this._loadGenres();
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

    async writeContentAsCategory(generalParams, movieParams, tvParams){
        let gp = generalParams;
        let mp = movieParams;
        let tp = tvParams;

        let currentDate = new Date();
        let expiryDateMs = currentDate.valueOf() + gp.validDuration; 
        let expiryDate = new Date(expiryDateMs);
        let category = { name: gp.categoryName, expiryDate: expiryDate }

        let prefMinEnPercent = 0.6;
        
        if (mp){
            try {
                let movieUrl = this.baseUrl + mp.endPoint;
                let movieResponse = await this.sendGetRequest(movieUrl, mp.queryParams);
                let fullResMovieData = movieResponse.data;
                let fullMovieResults = fullResMovieData.results;
                let movieCount = mp.FCCount + mp.BCCount;

                let enMovieCount = Math.ceil(prefMinEnPercent * movieCount);
                let enMovieResults = [];
                for (let [index, resData] of fullMovieResults.entries()){
                    if (enMovieResults.length === enMovieCount){
                        break;
                    }
                    if (resData.original_language === 'en'){
                        let enResData = fullMovieResults.splice(index, 1)[0];
                        enMovieResults.push(enResData);
                    }
                }
                let otherMovieCount = movieCount - (enMovieResults.length);
                let otherMovieResults = fullMovieResults.splice(0, otherMovieCount);
                let relevantMovieResults = enMovieResults.concat(otherMovieResults);

                for (let [index, resData] of relevantMovieResults.entries()){
                    let getMovieConfig;
                    let fullContent;
                    if (index < mp.FCCount){

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
                        if (!fullContent){
                            await this._loadGenres();
                        }
                        let config = getMovieConfig(resData, this.movieProps.genres);
                        let newMovie = new Movie(config);
                        newMovie.categories.push(category);
                        await newMovie.save();
                    } else {
                        let movie = movies[0];
                        let exisitingCategory = movie.categories.find(cat => {
                            return cat.name === gp.categoryName;
                        })
                        if (!exisitingCategory){
                            movie.categories.push(category);
                            await movie.save();
                        }
                    }
                }
            } catch (error){
                console.log(`ERR! writing ${gp.categoryName} movies failed.`, error);
                throw new Error(error);
            }
        }

        if (tp){
            try {
                let fullTvResults;
                let relevantTvResults;

                if (tp.filterFn){
                    let filterResults = await tp.filterFn();
                    fullTvResults = filterResults.fullTvResults;
                    relevantTvResults = filterResults.relevantTvResults;
                } else {
                    let latestTvUrl = this.baseUrl + tp.endPoint;
                    let tvResponse = await this.sendGetRequest(latestTvUrl, tp.queryParams);
                    let fullResTvData = tvResponse.data;
                    fullTvResults = fullResTvData.results
                    let tvCount = tp.FCCount + tp.BCCount;

                    let enTvCount = Math.ceil(prefMinEnPercent * tvCount);
                    let enTvResults = [];
                    for (let [index, resData] of fullTvResults.entries()){
                        if (enTvResults.length === enTvCount){
                            break;
                        }
                        if (resData.original_language === 'en'){
                            let enResData = fullTvResults.splice(index, 1)[0];
                            enTvResults.push(enResData);
                        }
                    }
                    let otherTvCount = tvCount - (enTvResults.length);
                    let otherTvResults = fullTvResults.splice(0, otherTvCount);
                    relevantTvResults = enTvResults.concat(otherTvResults);
                }

                for (let [index, resData] of relevantTvResults.entries()){
                    let getTvConfig;
                    let fullContent;
                    if (index < tp.FCCount){
                        let validFCTv = false;
                        while (!validFCTv){
                            let tvDetailUrl = this.baseUrl + '/tv/' + resData.id;
                            let response = await this.sendGetRequest(tvDetailUrl);
                            resData = response.data;
                            if (resData.number_of_episodes > 80){
                                resData = relevantTvResults[index + 1];
                                relevantTvResults.splice(index, 1);
                                let fillResData = fullTvResults.splice(0, 1)[0];
                                if (fillResData){
                                    relevantTvResults.push(fillResData);
                                }
                                console.log('continuing...');
                                continue;
                            }
                            validFCTv = true;
                        }
                        getTvConfig = configUtil.getTvShowConfigFC;
                        fullContent = true;
                    } else {
                        getTvConfig = configUtil.getTvShowConfigBC;
                        fullContent = false;
                    }
                    if (!resData){
                        console.log('invalid resData at index', index);
                        continue
                    }
                    console.log('tv iteration', index);

                    let tvShows = await TvShow.find({
                        title: resData.name,
                        firstAirDate: resData.first_air_date,
                        isFullContent: fullContent
                    })
                    if (tvShows.length === 0){
                        let config;
                        if (fullContent){
                            config = await getTvConfig(resData);
                        } else {
                            await this._loadGenres();
                            config = getTvConfig(resData, this.tvProps.genres);
                        }
                        let newTvShow = new TvShow(config);
                        newTvShow.categories.push(category);
                        await newTvShow.save();
                    } else {
                        let tvShow = tvShows[0];
                        let existingCategory = tvShow.categories.find(cat => {
                            return cat.name === gp.categoryName;
                        })
                        if (!existingCategory){
                            tvShow.categories.push(category);
                            await tvShow.save();
                        }
                    }
                }
            } catch (error){
                console.log(`ERR! writing ${gp.categoryName} tvshows failed.`, error);
                throw new Error(error);
            }
        }
    }

    async writeRecentlyAdded(){
        let generalParams = {
            categoryName: 'recently-added',
            validDuration: 1 * this.time.DAY
        }

        let currentDate = new Date();
        let timeDiffMs = currentDate.valueOf() - (2 * this.time.WEEK);
        let earliestDate = new Date(timeDiffMs);
        let currentDateYMDStr = currentDate.toISOString().split('T')[0];
        let earliestDateYMDStr = earliestDate.toISOString().split('T')[0];

        let movieParams = {
            FCCount: 3,
            BCCount: 5,
            endPoint: '/discover/movie',
            queryParams: {
                'primary_release_date.gte': earliestDateYMDStr,
                'primary_release_date.lte': currentDateYMDStr,
                'vote_average.gte': 6.5
            }
        }

        let tvParams = {
            FCCount: 3,
            BCCount: 4,
            endPoint: '/discover/tv',
            queryParams: {
                'first_air_date.gte': earliestDateYMDStr,
                'first_air_date.lte': currentDateYMDStr,
                'vote_average.gte': 6.5
            }
        }

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeTrendingNow(){
        let generalParams = {
            categoryName: 'trending',
            validDuration: 1 * this.time.DAY
        }

        let movieParams = {
            FCCount: 3,
            BCCount: 5,
            endPoint: '/trending/movie/week',
        }

        let tvParams = {
            FCCount: 3,
            BCCount: 4,
            endPoint: '/trending/tv/week',
        }

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeTvDramas(){
        let generalParams = {
            categoryName: 'tv-drama',
            validDuration: 1 * this.time.DAY
        }

        let movieParams;

        let genreNames = ['Drama', 'Documentary', 'Kids', 'Soap', 'Talk', 'News'];
        let genres = await this._getGenreIds(genreNames, 'tv');
        let excludedGenres = [ 
            genres.documentary, 
            genres.kids, 
            genres.soap, 
            genres.talk, 
            genres.news 
        ];
        let excludedGenresStr = excludedGenres.join(',');

        let tvParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/tv',
            queryParams: {
                with_genres: genres.drama,
                without_genres: excludedGenresStr,
            }
        }

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeMovieComedies(){
        let generalParams = {
            categoryName: 'movie-comedy',
            validDuration: 1 * this.time.DAY,
        }

        let genreNames = ['Comedy', 'Documentary', 'War', 'Thriller'];
        let genres = await this._getGenreIds(genreNames, 'movie');
        let excludedGenres = [ 
            genres.documentary,
            genres.war,
            genres.thriller
        ];
        let excludedGenresStr = excludedGenres.join(',');

        let movieParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/movie',
            queryParams: {
                with_genres: genres.comedy,
                without_genres: excludedGenresStr,
                'vote_average.gte': 7
            }
        }

        let tvParams;

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeBritishTvShows(){
        let generalParams = {
            categoryName: 'tv-british',
            validDuration: 1 * this.time.DAY,
        }

        let movieParams;

        let tvParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/tv',
            queryParams: {
                with_original_language: 'en',
                'vote_average.gte': 7
            }
        };

        let tvFilterFn = async () => {
            let tp = tvParams;
            let tvCount = tp.FCCount + tp.BCCount;
            let pageNo = 1;
            let relevantTvResults = [];
            let extraTvResults = [];

            while (relevantTvResults.length < tvCount){
                let tvUrl = this.baseUrl + tp.endPoint;
                let qParams = { ...tp.queryParams, page: pageNo };
                let tvResponse = await this.sendGetRequest(tvUrl, qParams);
                let fullResTvData = tvResponse.data;
                let fullTvResults = fullResTvData.results

                for (let resData of fullTvResults){
                    let isBritish = resData.origin_country.includes('GB');
                    let soapGenreId = await this._getGenreIds('Soap', 'tv');
                    let isSoap = resData.genre_ids.includes(parseInt(soapGenreId));
                    if (isBritish && !isSoap){
                        if (relevantTvResults.length < tvCount){
                            relevantTvResults.push(resData);
                        } else {
                            extraTvResults.push(resData);
                        }
                    }
                }
                pageNo++;
            }

            return { relevantTvResults: relevantTvResults, fullTvResults: extraTvResults };
        };

        tvParams.filterFn = tvFilterFn;

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writePopular(){
        let generalParams = {
            categoryName: 'popular',
            validDuration: 1 * this.time.DAY
        }

        let movieParams = {
            FCCount: 3,
            BCCount: 5,
            endPoint: '/movie/popular',
        }

        let tvParams = {
            FCCount: 3,
            BCCount: 4,
            endPoint: '/tv/popular',
        }

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeTvComedies(){
        let generalParams = {
            categoryName: 'tv-comedy',
            validDuration: 1 * this.time.DAY,
        }

        let genreNames = ['Comedy', 'Documentary', 'Soap', 'Talk', 'News', 'Action & Adventure'];
        let genres = await this._getGenreIds(genreNames, 'tv');
        let excludedGenres = [ 
            genres.documentary,
            genres.soap,
            genres.talk,
            genres.news,
            genres['action & adventure'],
        ];
        let excludedGenresStr = excludedGenres.join(',');

        let movieParams;

        let tvParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/tv',
            queryParams: {
                with_genres: genres.comedy,
                without_genres: excludedGenresStr,
                'vote_average.gte': 7
            }
        };

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async writeCrimeMovies(){
        let generalParams = {
            categoryName: 'movie-crime',
            validDuration: 1 * this.time.DAY,
        }

        let includedGenNames = ['Crime', 'Drama'];
        let excludedGenNames = ['Documentary'];
        let genreStrings = await this._getGenreStrings(includedGenNames, excludedGenNames);
        let [incGenresStr, excGenresStr] = genreStrings;

        let currentDate = new Date();
        let timeDiffMs = currentDate.valueOf() - (3 * this.time.YEAR);
        let earliestDate = new Date(timeDiffMs);
        let earliestDateYMDStr = earliestDate.toISOString().split('T')[0];

        let movieParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/movie',
            queryParams: {
                with_genres: incGenresStr,
                without_genres: excGenresStr,
                'vote_average.gte': 7,
                'primary_release_date.gte': earliestDateYMDStr
            }
        };

        let tvParams;

        await this.writeContentAsCategory(generalParams, movieParams, tvParams);
    }

    async _getGenreIds(type, genreNames){
        // This first parameter is a single genre name string
        // or an array of genre name strings. The second parameter
        // is the content type [movie or tv]. The function returns 
        // an object mapping genre names to ids
        await this._loadGenres();

        let props = (type === 'movie') ? this.movieProps : this.tvProps;
        
        let genNames = [].concat(genreNames);
        let genList = props.genres;
        let allGenNames = genList.map(gen => gen.name);
        let genNamesLower = genNames[0] ? genNames.map(name => name.toLowerCase()): allGenNames;
        let genresObj = {};

        genList.forEach(gen => {
            let genNameLower = gen.name.toLowerCase()
            if (genreNames instanceof Array){
                if (genNamesLower.includes(genNameLower)){
                    genresObj[genNameLower] = gen.id;
                }
            } else {
                genresObj[genNameLower] = gen.id;
            }
        });

        if (typeof genreNames === 'string'){
            let genreName = genNamesLower[0];
            return genresObj[genreName];
        } else {
            return genresObj;
        }
    }

    async _getGenreStrings(includedGenNames, excludedGenNames, type){
        let genres = await this._getGenreIds(type);
        let incGenreIds= [];
        let excGenreIds = [];
        includedGenNames.forEach(gname => { 
            let genId = genres[gname.toLowerCase()];
            incGenreIds.push(genId);
        });
        excludedGenNames.forEach(gname => { 
            let genId = genres[gname.toLowerCase()];
            excGenreIds.push(genId);
        });
        let incGenresStr = incGenreIds.join(',');
        let excGenresStr = excGenreIds.join(',');

        return [incGenresStr, excGenresStr];
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


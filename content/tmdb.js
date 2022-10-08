const axios = require('axios');

const config = require('../config/config');
const { Movie, TvShow } = require('./models');
const modelConfig = require('./model-config');
const fileUtil = require('../core/utils/file');


class TheMovieDB {
    constructor(apiKey, contentSource){
        if (!apiKey){
            throw new Error('API Key is required to initialize TMDB.');
        }
        
        let validSources = Object.values(config.CONTENT_SOURCES);
        if (!validSources.includes(contentSource)){
            throw new Error('Provide a valid content source value.');
        }

        this.key = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p';
    
        this.movieProps = {};
        this.tvProps = {};

        this.mostPopular = [];

        this.generalValidDuration = '23-hr';
        this.generalWriteInterval = '24-hr';

        this.forceGeneralDuration = true;
        this.forceGeneralInterval = true;
        // this.validDurations = {};

        this.categories = {
            'recently-added': { method: this.writeRecentlyAdded },
            'trending': { method: this.writeTrendingNow },
            'most-popular': { method: this.writeMostPopular },
            'popular': { method: this.writePopular },
            'tv-drama': { method: this.writeTvDramas },
            'tv-brtish': { method: this.writeBritishTvShows },
            'tv-comedy': { method: this.writeTvComedies },
            'movie-comedy': { method: this.writeMovieComedies },
            'movie-crime': { method: this.writeCrimeMovies },
        }

        this._setTimeProperties();

        if (contentSource === 'REMOTE'){
            this.initializeDatabase();
        } 
    }
    
    _setTimeProperties(){
        let time = {}

        time.MILLISECOND = 1;
        time.SECOND = 1000;
        time.MINUTE = 60 * time.SECOND;
        time.HOUR = 60 * time.MINUTE;
        time.DAY = 24 * time.HOUR;
        time.WEEK = 7 * time.DAY;
        time.MONTH = 30 * time.DAY;
        time.YEAR = 365 * time.DAY;

        let timeMap = new Map([
            [['ms', 'msec', 'millisecond'], 'MILLISECOND'],
            [['s','sec', 'second'], 'SECOND'], 
            [['m', 'min', 'minute'], 'MINUTE'], 
            [['h', 'hr', 'hour'], 'HOUR'],
            [['d', 'day'], 'DAY'],
            [['w', 'wk', 'week'], 'WEEK'],
            [['mo', 'month'], 'MONTH'],
            [['y', 'yr', 'year'], 'YEAR']
        ]);

        this.time = time;
        this.timeMap = timeMap;
    }

    async _loadGenres(){
        if (!this.movieProps.genres || !this.tvProps.genres){
            try {
                let movieGenresPath = 'content/data/movie-genres.json';
                let movieGenresStr = await fileUtil.loadFile(movieGenresPath);
                let movieGenres = JSON.parse(movieGenresStr);

                let tvGenresPath = 'content/data/tv-genres.json';
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

    async _getGenreIds(type, genreNames){
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

    getTime(durationStr){
        let durationParts = durationStr.split('-');
        if (durationParts.length !== 2){
            throw new Error('Invalid Duration String');
        }

        let [value, unit] = durationParts;
        value = parseFloat(value);
        unit = unit.toLowerCase();

        let UNIT;
        for (let unitList of this.timeMap.keys()){
            if (unitList.includes(unit)){
                UNIT = this.timeMap.get(unitList);
                break;
            }
        }

        let durationMs = value * this.time[UNIT];
        if (!durationMs){
            return 0;
        } 
        return durationMs;
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

    async writeMoviesAsCategory(generalParams, movieParams){
        let gp = generalParams;
        let mp = movieParams;

        let validDuration;
        if (this.forceGeneralDuration){
            let validDurationStr = this.generalValidDuration;
            validDuration = this.getTime(validDurationStr);
        } else {
            // let validDurationStr = this.validDurations[gp.categoryName];
            let validDurationStr = this.categories[gp.categoryName].validDuration;
            if (!validDurationStr){
                validDurationStr = this.generalValidDuration;
            }
            validDuration = this.getTime(validDurationStr)
        }

        let currentDate = new Date();
        let expiryDateMs = currentDate.valueOf() + validDuration; 
        let expiryDate = new Date(expiryDateMs);
        let category = { name: gp.categoryName, expiryDate: expiryDate };

        let prefMinEnPercent = 0.6;
        
        try {
            let relevantMovieResults;
            let mostPopularIndex;

            if (mp.filterFn){
                let filterResults = await mp.filterFn();
                relevantMovieResults = filterResults.relevantMovieResults;
                if (category.name === 'most-popular'){
                    mostPopularIndex = filterResults.index;
                }
            } else {
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
                relevantMovieResults = enMovieResults.concat(otherMovieResults);
            }

            for (let [index, resData] of relevantMovieResults.entries()){
                let getMovieConfig;
                let fullContent;
                if (index < mp.FCCount){

                    let movieDetailUrl = this.baseUrl + '/movie/' + resData.id;

                    let response = await this.sendGetRequest(movieDetailUrl);
                    resData = response.data;
                    getMovieConfig = modelConfig.getMovieConfigFC;
                    fullContent = true;
                } else {
                    getMovieConfig = modelConfig.getMovieConfigBC;
                    fullContent = false;
                }
                console.log('movie iteration', index, resData.id, gp.categoryName);

                let movies = await Movie.find({
                    title: resData.title,
                    releaseDate: resData.release_date,
                    isFullContent: fullContent
                })
                
                let movie;
                if (movies.length === 0){
                    if (!fullContent){
                        await this._loadGenres();
                    }
                    let config = await getMovieConfig(resData, this.movieProps.genres);
                    movie = new Movie(config);
                    movie.categories.push(category);
                    await movie.save();
                } else {
                    movie = movies[0];
                    let existingCatIndex = movie.categories.findIndex(cat => {
                        return cat.name === gp.categoryName;
                    })
                    if (existingCatIndex === -1){
                        movie.categories.push(category);
                    } else {
                        movie.categories[existingCatIndex] = category;
                    }
                    await movie.save();
                }
                if (category.name === 'most-popular'){
                    return { content: movie, index: mostPopularIndex }
                }
            }
        } catch (error){
            console.log(`ERR! writing ${gp.categoryName} movies failed.`, error);
            throw new Error(error);
        }
    }

    async writeTvShowsAsCategory(generalParams, tvParams){
        let gp = generalParams;
        let tp = tvParams;

        let validDuration;
        if (this.forceGeneralDuration){
            let validDurationStr = this.generalValidDuration;
            validDuration = this.getTime(validDurationStr);
        } else {
            let validDurationStr = this.categories[gp.categoryName].validDurations;
            if (!validDurationStr){
                validDurationStr = this.generalValidDuration;
            }
            validDuration = this.getTime(validDurationStr)
        }

        let currentDate = new Date();
        let expiryDateMs = currentDate.valueOf() + validDuration; 
        let expiryDate = new Date(expiryDateMs);
        let category = { name: gp.categoryName, expiryDate: expiryDate }

        let prefMinEnPercent = 0.6;

        try {
            let fullTvResults;
            let relevantTvResults;
            let mostPopularIndex;

            if (tp.filterFn){
                let filterResults = await tp.filterFn();
                fullTvResults = filterResults.fullTvResults;
                relevantTvResults = filterResults.relevantTvResults;
                if (category.name === 'most-popular'){
                    mostPopularIndex = filterResults.index;
                }
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
                        if (!resData){
                            break;
                        }
                        let tvDetailUrl = this.baseUrl + '/tv/' + resData.id;
                        let response = await this.sendGetRequest(tvDetailUrl);
                        resData = response.data;
                        if (resData.number_of_episodes > 80){
                            resData = relevantTvResults[index + 1];
                            if (!resData){
                                resData = fullTvResults.splice(0, 1)[0];
                            } else {
                                relevantTvResults.splice(index, 1);
                                let fillResData = fullTvResults.splice(0, 1)[0];
                                if (fillResData){
                                    relevantTvResults.push(fillResData);
                                }
                            }
                            console.log('continuing...');
                            continue;
                        }
                        validFCTv = true;
                    }
                    getTvConfig = modelConfig.getTvShowConfigFC;
                    fullContent = true;
                } else {
                    getTvConfig = modelConfig.getTvShowConfigBC;
                    fullContent = false;
                }
                if (!resData){
                    console.log('invalid resData at index', index);
                }
                console.log('tv iteration', index, resData.id, gp.categoryName);

                let tvShows = await TvShow.find({
                    title: resData.name,
                    firstAirDate: resData.first_air_date,
                    isFullContent: fullContent
                })
                let tvShow;
                if (tvShows.length === 0){
                    let config;
                    if (fullContent){
                        config = await getTvConfig(resData);
                    } else {
                        await this._loadGenres();
                        config = await getTvConfig(resData, this.tvProps.genres);
                    }
                    tvShow = new TvShow(config);
                    tvShow.categories.push(category);
                    await tvShow.save();
                } else {
                    tvShow = tvShows[0];
                    let existingCatIndex = tvShow.categories.findIndex(cat => {
                        return cat.name === gp.categoryName;
                    })
                    if (existingCatIndex === -1){
                        tvShow.categories.push(category);
                    } else {
                        tvShow.categories[existingCatIndex] = category;
                    }
                    await tvShow.save();
                }
                if (category.name === 'most-popular'){
                    return { content: tvShow, index: mostPopularIndex}
                }
            }
        } catch (error){
            console.log(`ERR! writing ${gp.categoryName} tvshows failed.`, error);
            throw new Error(error);
        }
    }

    async writeRecentlyAdded(){
        let generalParams = {
            categoryName: 'recently-added',
            // validDuration: 1 * this.time.DAY
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

        await this.writeMoviesAsCategory(generalParams, movieParams);
        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writeTrendingNow(){
        let generalParams = {
            categoryName: 'trending',
            // validDuration: 1 * this.time.DAY
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

        await this.writeMoviesAsCategory(generalParams, movieParams);
        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writeTvDramas(){
        let generalParams = {
            categoryName: 'tv-drama',
            // validDuration: 1 * this.time.DAY
        };

        let includedGenNames = ['Drama'];
        let excludedGenNames = ['Documentary', 'Kids', 'Soap', 'Talk', 'Mews'];
        let genreStrings = await this._getGenreStrings(includedGenNames, excludedGenNames, 'movie');
        let [incGenresStr, excGenresStr] = genreStrings;

        let tvParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/tv',
            queryParams: {
                with_genres: incGenresStr,
                without_genres: excGenresStr,
            }
        };

        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writeMovieComedies(){
        let generalParams = {
            categoryName: 'movie-comedy',
            // validDuration: 1 * this.time.DAY,
        }

        let includedGenNames = ['Comedy'];
        let excludedGenNames = ['Documentary', 'War', 'Thriller'];
        let genreStrings = await this._getGenreStrings(includedGenNames, excludedGenNames, 'movie');
        let [incGenresStr, excGenresStr] = genreStrings;

        let movieParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/movie',
            queryParams: {
                with_genres: incGenresStr,
                without_genres: excGenresStr,
                'vote_average.gte': 7
            }
        }

        await this.writeMoviesAsCategory(generalParams, movieParams);
    }

    async writeBritishTvShows(){
        let generalParams = {
            categoryName: 'tv-british',
            // validDuration: 1 * this.time.DAY,
        };

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

        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writePopular(){
        let generalParams = {
            categoryName: 'popular',
            // validDuration: 1 * this.time.DAY
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

        await this.writeMoviesAsCategory(generalParams, movieParams);
        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writeTvComedies(){
        let generalParams = {
            categoryName: 'tv-comedy',
            // validDuration: 1 * this.time.DAY,
        }

        let includedGenNames = ['Comedy'];
        let excludedGenNames = ['Documentary', 'Soap', 'Talk', 'News', 'Action & Adventure'];
        let genreStrings = await this._getGenreStrings(includedGenNames, excludedGenNames, 'tv');
        let [incGenresStr, excGenresStr] = genreStrings;

        let tvParams = {
            FCCount: 6,
            BCCount: 9,
            endPoint: '/discover/tv',
            queryParams: {
                with_genres: incGenresStr,
                without_genres: excGenresStr,
                'vote_average.gte': 7
            }
        };

        await this.writeTvShowsAsCategory(generalParams, tvParams);
    }

    async writeCrimeMovies(){
        let generalParams = {
            categoryName: 'movie-crime',
            // validDuration: 1 * this.time.DAY,
        }

        let includedGenNames = ['Crime', 'Drama'];
        let excludedGenNames = ['Documentary'];
        let genreStrings = await this._getGenreStrings(includedGenNames, excludedGenNames, 'movie');
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

        await this.writeMoviesAsCategory(generalParams, movieParams);
    }

    async writeMostPopular(){
        let generalParams = {
            categoryName: 'most-popular',
            // validDuration: 1 * this.time.DAY
        };

        let type;
        if (this.mostPopular.length === 0){
            type = 'movie';
        } else {
            let currentMp = this.mostPopular.slice(-1)[0];
            type = (currentMp.type === 'movie') ? 'tv': 'movie';
        }

        let genFilterFn = async (params, type) => {
            let p = params;
            let mostPopular = this.mostPopular;

            let url = this.baseUrl + p.endPoint;
            let response = await this.sendGetRequest(url);
            let fullResData = response.data;
            let fullResults = fullResData.results;

            let spliceLength = 5;
            let filteredResults = [];
            if (type === 'tv'){
                for (let resData of fullResults.splice(0, spliceLength)){
                    let detailUrl = this.baseUrl + '/' + type + '/' + resData.id;
                    let detailResponse = await this.sendGetRequest(detailUrl);
                    let detailResData = detailResponse.data;
                    if (detailResData.number_of_episodes <= 80){
                        filteredResults.push(resData);
                    }
                }
            } else {
                filteredResults = fullResults.splice(0, spliceLength);
            }
            
            let newIndex;
            if (mostPopular.length > 1){
                let prevMp = mostPopular.find(mp => mp.type === type);
                let prevIndex = prevMp.index;
                newIndex = (prevIndex < 4) ? prevIndex + 1 : 0;
            } else {
                newIndex = 0;
            }
            let relevantResults = filteredResults.splice(newIndex, 1);
            fullResults = filteredResults.concat(fullResults);
            return { relevantResults: relevantResults, fullResults: fullResults, index: newIndex };
        }

        let mostPopularData;
        if (type === 'movie'){
            console.log(type);
            let movieParams = {
                FCCount: 1,
                BCCount: 0,
                endPoint: '/movie/popular',
            };
            let movieFilterFn = async () => {
                let movieResults = await genFilterFn(movieParams, type);

                return { 
                    relevantMovieResults: movieResults.relevantResults, 
                    index: movieResults.index
                };
            }
            movieParams.filterFn = movieFilterFn;

            mostPopularData = await this.writeMoviesAsCategory(generalParams, movieParams);
        }
        if (type === 'tv'){
            console.log(type)
            let tvParams = {
                FCCount: 1,
                BCCount: 0,
                endPoint: '/tv/popular'
            };
            let tvFilterFn = async () => {
                let tvResults = await genFilterFn(tvParams, type);

                return { 
                    relevantTvResults: tvResults.relevantResults,
                    fullTvResults: tvResults.fullResults,
                    index: tvResults.index
                };
            }
            tvParams.filterFn = tvFilterFn;

            mostPopularData = await this.writeTvShowsAsCategory(generalParams, tvParams);
        } 
        
        if (mostPopularData){
            let newMostPopular = {
                index: mostPopularData.index,
                type: type,
                content: mostPopularData.content
            }
            if (this.mostPopular.length > 1){
                this.mostPopular.shift();
            }
            this.mostPopular.push(newMostPopular);

            return newMostPopular;
        }
    }

    async clearExpiredContentCategories(){
        let currentDate = new Date();
        try {
            let expiredCatMovies = await Movie.find({
                'categories.expiryDate': {$lte: currentDate}
            });
            let expiredCatTvShows = await TvShow.find({
                'categories.expiryDate': {$lte: currentDate}
            });
            let expiredCatContent = expiredCatMovies.concat(expiredCatTvShows);

            for (let expiredCatContentDoc of expiredCatContent){
                let isUpdated = false;
                let categories = expiredCatContentDoc.categories;
                for (let [index, cat] of categories.entries()){
                    if (cat.expiryDate <= currentDate){
                        categories.splice(index, 1);
                        if (!isUpdated){
                            isUpdated = true;
                        }
                    }
                }
                if (isUpdated){
                    await expiredCatContentDoc.save();
                }
            }
        } catch (error){
            console.log('ERR! clearing expired categories failed.', error);
            throw new Error(error);
        }
    }

    async clearUncategorizedMovies(){
        try {
            await Movie.deleteMany({ categories: {$size: 0} });

            console.log('cleared uncategorized movies');
        } catch (error){
            console.log('ERR! clearing uncategorized movies failed.', error);
            throw new Error(error);
        }
    }

    async clearUncategorizedTvShows(){
        try {
            await TvShow.deleteMany({ 
                categories: {$size: 0},
                isFullContent: false
            });
            let uncategorizedFCTvShows = await TvShow.find({ 
                categories: {$size: 0},
                isFullContent: true
            });

            for (let tvShow of uncategorizedFCTvShows){
                await tvShow.clearSeasons();
                tvShow.delete();
            }

            console.log('cleared uncategorized tvshows');
        } catch (error){
            console.log('ERR! clearing uncategorized movies failed.', error);
            throw new Error(error);
        }
    }

    async initializeDatabase(){
        console.log('Initializing Database');
        try {
            for (let categoryName in this.categories){
                let interval = this.getTime(this.generalWriteInterval);
                let writeMethod = this.categories[categoryName].method;

                await writeMethod.call(this);

                let intervalID = setInterval(() => {
                    writeMethod.call(this);
                }, interval);

                this.categories[categoryName].intervalID = intervalID;
                this.categories[categoryName].isIntervalGeneral = true;
            }

            let cleanInterval = this.getTime(this.generalWriteInterval) + (2 * this.time.MINUTE);
            let cleanIntervalID = setInterval(async () => {
                await this.clearExpiredContentCategories();

                this.clearUncategorizedMovies();
                this.clearUncategorizedTvShows();
            }, cleanInterval);

            this.cleanIntervalID = cleanIntervalID;
        } catch (error){
            console.log('An Error occured during initialization.', error);
        }
    }

    setWriteInterval(categoryName, writeInterval, forceNewInterval=false){
        let category = this.categories[categoryName];
        let currentIntervalID = category.intervalID;
        let newInterval = this.getTime(writeInterval);

        clearInterval(currentIntervalID);
        let newIntervalID = setInterval(() => {
            // category.method();

            if (!forceNewInterval){
                let generalInterval = this.getTime(this.generalWriteInterval);
                clearInterval(category.intervalID);
                let intervalID = setInterval(() => {
                    // category.method();
                }, generalInterval);
                this.categories[categoryName].intervalID = intervalID;
                this.categories[categoryName].isIntervalGeneral = true;
            }
        }, newInterval);

        category.intervalID = newIntervalID;
        category.isIntervalGeneral = false;
    }

    setGeneralWriteInterval(writeInterval){
        let interval = this.getTime(writeInterval);

        for (let categoryName in this.categories){
            let category = this.categories[categoryName];
            let currentIntervalID = category.intervalID;
            let isGeneral = category.isIntervalGeneral;

            if (this.forceGeneralInterval || isGeneral){
                clearInterval(currentIntervalID);
                let intervalID = setInterval(() => {
                    // category.method();
                }, interval);

                category.intervalID = intervalID;
                category.isIntervalGeneral = true;
            }
        }
    }
}


module.exports = TheMovieDB;

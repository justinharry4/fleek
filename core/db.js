const mongoose = require('mongoose');

const config = require('../config/config');
const events = require('./events/events');
const { dbEmitter } = require('./events/emitters');
const TheMovieDB = require('../content/tmdb');

async function makeDatabaseConnection(app){
    try {
        await mongoose.connect(config.MONGO_DB_URI, { useNewUrlParser: true });
        console.log('mongoose connected');
        
        let tmdb = new TheMovieDB(config.TMDB_API_KEY, config.CONTENT_SOURCE);

        module.exports.tmdb = tmdb;

        dbEmitter.emit(events.POST_DB_CONNECTION, app);
    } catch (err) {
        throw err;
    }
};

module.exports.makeDatabaseConnection = makeDatabaseConnection;


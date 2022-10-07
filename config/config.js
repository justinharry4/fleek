const dotenv = require('dotenv');

dotenv.config();

const PORT = 16001;

const MONGO_DB_URI = 'mongodb://127.0.0.1:27017/fleek';

const SESSION_SECRET = 'randomlygeneratedstring';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const CONTENT_SOURCES = { LOCAL: 'LOCAL', REMOTE: 'REMOTE' };

const CONTENT_SOURCE = CONTENT_SOURCES.LOCAL;

module.exports = {
    PORT,
    MONGO_DB_URI,
    SESSION_SECRET,
    TMDB_API_KEY,
    CONTENT_SOURCES,
    CONTENT_SOURCE,
};

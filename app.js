const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbSessionStore = require('connect-mongodb-session')(session);

// importing routes
const contentRoutes = require('./routes/content');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');
// importing models
const User = require('./models/user');
const Movie = require('./models/movie');
const TheMovieDB = require('./database/tmdb');

const fileUtil = require('./util/file');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// configurations
const PORT = 15000;
const publicPath = fileUtil.makePath('public');
const faviconPath = fileUtil.makePath('public/images/favicon.ico');
const MONGO_DB_URI = 'mongodb://127.0.0.1:27017/fleek';
const sessionStore = new mongoDbSessionStore({uri: MONGO_DB_URI, collection: 'sessions'});
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// CATCH-ALL MIDDLEWARE
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(faviconPath));
app.use(express.static(publicPath));
app.use(session({
    secret: ['randomlygeneratedstring'],
    saveUninitialized: false,
    resave: false,
    store: sessionStore
}));

// END POINTS
app.use(contentRoutes);
app.use(authRoutes);
app.use(errorRoutes);

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    console.log('INSIDE ERROR HANDLER', error);
    res.redirect('/server-error');
})

async function startApp(){
    try {
        await mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true });
        console.log('mongoose connected')

        // mongoose.connection.dropCollection('movies');
        // mongoose.connection.dropCollection('tvshows');
        // mongoose.connection.dropCollection('seasons');
        // mongoose.connection.dropCollection('episodes');
        const TMDB = new TheMovieDB(TMDB_API_KEY);
        await TMDB.writeRecentlyAdded();
        
        console.log(`server running on port ${PORT}`);
        // app.listen(PORT);
        return
    } catch (err) {
        console.log('STARTAPP ERROR', err)
    }
}

startApp();

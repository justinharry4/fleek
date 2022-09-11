const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbSessionStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

// importing routes
const contentRoutes = require('./routes/content');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');
const adminRoutes = require('./routes/admin');

const generalController = require('./controllers/general');
const fileUtil = require('./util/file');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); 

// configurations
const PORT = 16000;
const publicPath = fileUtil.makePath('public');
const faviconPath = fileUtil.makePath('public/images/favicon.ico');
const MONGO_DB_URI = 'mongodb://127.0.0.1:27017/fleek';
const sessionStore = new mongoDbSessionStore({uri: MONGO_DB_URI, collection: 'sessions'});
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// CATCH-ALL MIDDLEWARE (third-party)
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(faviconPath));
app.use(express.static(publicPath));
app.use(session({
    secret: ['randomlygeneratedstring'],
    saveUninitialized: false,
    resave: false,
    store: sessionStore
}));
app.use(flash());

// CATCH-ALL MIDDLEWARE
// app.use(generalController.setCORSHeaders);
app.use(generalController.getUser);

// END POINTS
app.use(contentRoutes);
app.use(authRoutes);
app.use(adminRoutes);
app.use(errorRoutes);

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    console.log('INSIDE ERROR HANDLER\n', error);
    
    if (!error.data || error.data.resType === 'text/html'){
        return res.redirect('/server-error');
    }
    if (error.data.resType === 'application/json'){
        return res.redirect('/server-error?type=json')
    }
})

async function startApp(){
    try {
        await mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true });
        console.log('mongoose connected')

        // TMDB.initializeDatabase();
        
        console.log(`server running on port ${PORT}`);
        app.listen(PORT);
    } catch (err) {
        console.log('STARTAPP ERROR', err)
    }
}

startApp();
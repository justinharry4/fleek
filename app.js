const express = require('express');
const bodyParser = require('body-parser');

// importing routes
const contentRoutes = require('./routes/content');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');

const fileUtil = require('./util/file');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// middleware configurations
const PORT = 4000;
const publicPath = fileUtil.makePath('public');

// CATCH-ALL MIDDLEWARE
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(publicPath));

// END POINTS
app.use(contentRoutes);
app.use('/auth', authRoutes);
app.use(errorRoutes);

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    console.log('INSIDE ERROR HANDLER', error);
    res.redirect('/server-error');
})

console.log(`server running on port ${PORT}`);
app.listen(PORT);
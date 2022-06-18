const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const contentRoutes = require('./routes/content');
const errorRoutes = require('./routes/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// middleware configurations
const PORT = 4000;
const publicPath = path.join(__dirname, 'public');

// CATCH-ALL MIDDLEWARE
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(publicPath));

// END POINTS
app.use(contentRoutes);
app.use(errorRoutes);

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    console.log('INSIDE ERROR HANDLER', error);
})

console.log(`server running on port ${PORT}`);
app.listen(PORT);
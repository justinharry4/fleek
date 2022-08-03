const Movie = require('../models/movie');
const TvShow = require('../models/tvshow');

async function findContentById(id){
    try {
        let movie = await Movie.findById(id);
        if (movie){
            return movie; 
        }
        let tvshow = await TvShow.findById(id);
        if (tvshow){
            return tvshow;
        }
    } catch(error){
        throw error;
    }
}

module.exports.findContentById = findContentById;
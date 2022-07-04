const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = Schema({
    title: {
        type: String,
        required: true
    },
    overview: {
        type: String,
    },
    genres: [
        {
            type: String,
            required: true
        }
    ],
    releaseDate: {
        type: String,
        required: true
    },
    releaseYear: {
        type: String,
        required: true
    },
    durationMins: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    languages: [
        {
            type: String,
            required: true
        }
    ],
    starRating: {
        type: Number,
        required: true
    },
    popularity: {
        type: Number,
        required: true
    },
    releaseStatus: {
        type: String,
    },
    coverPath: {
        type: String,
        required: true
    },
    videoPath: {
        type: String,
        required: true
    },
    productionCompanies: [
        {
            type: String,
            required: true
        }
    ],
    networks: [
        {
            type: String,
        }
    ],
})

const movieModel = mongoose.model('Movie', movieSchema);

module.exports = movieModel;
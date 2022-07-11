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
    },
    country: {
        type: String,
    },
    countryCode: {
        type: String,
    },
    language: {
        type: String,
    },
    spokenLanguages: [
        {
            type: String,
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
    },
    productionCompanies: [
        {
            type: String,
        }
    ],
    networks: [
        {
            type: String,
        }
    ],
    isFullContent: {
        type: Boolean,
        required: true
    },
    categories: [
        {
            name: { 
                type: String
            },
            expiryDate: { 
                type: Date
            }
        }
    ]
});

const movieModel = mongoose.model('Movie', movieSchema);

module.exports = movieModel;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tvShowSchema = Schema({
    title: {
        type: String,
        required: true,
    },
    overview: {
        type: String,
    },
    seasonCount: {
        type: Number,
        required: true,
    },
    episodeCount: {
        type: Number,
        required: true,
    },
    genres: [
        {
            type: String,
            required: true
        }
    ],
    seasons: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Season',
            required: true
        }
    ],
    latestEpisode: {
        type: Schema.Types.ObjectId,
        ref: 'Episode',
        required: true
    },
    firstAirDate: {
        type: String,
        required: true,
    },
    firstAirYear: {
        type: String,
        required: true,
    },
    lastAirDate: {
        type: String,
    },
    avgDurationMins: [
        {
            type: Number,
        }
    ],
    country: {
        type: String,
        required: true,
    },
    countryCode: {
        type: String,
        required: true,
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
        required: true,
    },
    tvShowStatus: {
        type: String,
        required: true,
    },
    productionCompanies: [
        {
            type: String,
        }
    ],
    coverPath:  {
        type: String,
        required: true,
    },
    networks: [
        {
            type: String,
        }
    ],
    isFullContent: {
        type: Boolean,
        default: false,
        required: true
    },
    categories: [
        {
            type: String
        }
    ]
}); 

const tvShowModel = mongoose.model('TvShow', tvShowSchema);

module.exports = tvShowModel;
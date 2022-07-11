const mongoose = require('mongoose');

const Season = require('./season');

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
    },
    episodeCount: {
        type: Number,
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
        }
    ],
    latestEpisode: {
        type: Schema.Types.ObjectId,
        ref: 'Episode',
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
        required: true,
    },
    tvShowStatus: {
        type: String,
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

async function clearSeasons(){
    let seasonIds = this.seasons;
    for (let seasonId of seasonIds){
        let season = await Season.findById(seasonId);
        await season.clearEpisodes();
        season.delete();
    }
}

tvShowSchema.methods.clearSeasons = clearSeasons;

const tvShowModel = mongoose.model('TvShow', tvShowSchema);

module.exports = tvShowModel;
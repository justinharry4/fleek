const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

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
            type: ObjectId,
            ref: 'Season',
        }
    ],
    latestEpisode: {
        type: ObjectId,
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
    backdropPath: {
        type: String,
        required: true
    },
    logoURL: {
        type: String,
        required: true
    },
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
const TvShow = mongoose.model('TvShow', tvShowSchema);


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
    backdropPath: {
        type: String,
        required: true
    },
    logoURL: {
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

const Movie = mongoose.model('Movie', movieSchema);


const seasonSchema = Schema({
    tvShowTitle: {
        type: String,
        required: true
    },
    seasonNo: {
        type: Number,
        required: true
    },
    overview: {
        type: String,
    },
    episodeCount: {
        type: Number,
        required: true
    },
    episodes: [
        {
            type: ObjectId,
            ref: 'Episode',
            required: true
        }
    ],
    airDate: {
        type: String,
        required: true
    },
    coverPath: {
        type: String,
    },
    releaseStatus: {
        type: String,
        required: true
    }
});

async function clearEpisodes(){
    let episodeIds = this.episodes;
    for (let episodeId of episodeIds){
        await Episode.findByIdAndDelete(episodeId);
    }
}

seasonSchema.methods.clearEpisodes = clearEpisodes
const Season = mongoose.model('Season', seasonSchema);


const episodeSchema = Schema({
    title: {
        type: String,
    },
    tvShowTitle: {
        type: String,
        required: true
    },
    episodeNo: {
        type: Number,
        required: true
    },
    seasonNo: {
        type: Number,
        required: true
    },
    overview: {
        type: String,
    },
    durationMins: {
        type: Number,
    },
    airDate: {
        type: String,
        required: true
    },
    releaseStatus: {
        type: String,
        required: true
    },
    stillImagePath: {
        type: String,
    },
    videoPath: {
        type: String,
        required: true
    }
});

const Episode = mongoose.model('Episode', episodeSchema);


module.exports = { Movie, TvShow, Season, Episode };
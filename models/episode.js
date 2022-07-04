const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
        required: true
    },
    airDate: {
        type: String,
        required: true
    },
    stillImagePath: {
        type: String,
        required: true
    },
    videoPath: {
        type: String,
        required: true
    }
});

const episodeModel = mongoose.model('Episode', episodeSchema);

module.exports = episodeModel;
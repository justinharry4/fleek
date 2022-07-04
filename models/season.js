const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
            type: Schema.Types.ObjectId,
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
        required: true
    }
});

const seasonModel = mongoose.model('Season', seasonSchema);

module.exports = seasonModel;
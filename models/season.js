const mongoose = require('mongoose');

const Episode = require('./episode');

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

const seasonModel = mongoose.model('Season', seasonSchema);

module.exports = seasonModel;
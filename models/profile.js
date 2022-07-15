const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const profileSchema = Schema({
    name: { 
        type: String,
        required: true
    },
    profilePhotoUrl: {
        type: String,
        default: '**default path**'
    },
    kid: {
        type: Boolean,
        required: true
    },
    recentlyWatchedMovies: [
        {
            type: ObjectId,
            ref: 'Movie'
        }
    ],
    recentlyWatchedTvs: [
        {
            type: ObjectId,
            ref: 'TvShow'
        }
    ],
    contentList: [
        {
            type: ObjectId
        }
    ],
    likedContent: [
        {
            type: ObjectId
        }
    ],
    viewedContent: [
        {
            type: ObjectId,
        }
    ]
});

const profileModel = mongoose.model('Profile', profileSchema);

module.exports = profileModel;
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
        default: '/images/def-profile-photo.png'
    },
    kid: {
        type: Boolean,
        required: true
    },
    user: {
        type: ObjectId,
        required: true
    },
    setupComplete: {
        type: Boolean,
        default: false,
        required: true
    },
    settings: {
        languages: [
            {
                type: String,
            }
        ]
    },
    list: [
        {
            type: ObjectId
        }
    ],
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
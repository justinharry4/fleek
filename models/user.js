const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        default: '**default path**'
    },
    activeDevices: [
        { type: String }
    ],
    kids: {
        type: Object,
        ref: '**some ref**'
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
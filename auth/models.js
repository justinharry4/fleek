const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

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
        default: 'New Fleek User'
    },
    subscriptionPlan: {
        type: String,
    },
    activeDevices: [
        { type: String }
    ],
    profiles: [
        {
            type: ObjectId,
            ref: 'Profile'
        }
    ],
    member: {
        type: Boolean,
        default: false
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports.User = userModel;
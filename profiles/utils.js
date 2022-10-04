const { Profile } = require('./models');

async function isUserProfile(profileId, user){
    let profile = await Profile.findById(profileId);
    let isUserProfile;
    if (profile){
        isUserProfile = profile.user.toString() === user._id.toString();
    }

    return (isUserProfile) ? profile : false;
}


module.exports = { isUserProfile };
const User = require('../models/user');

module.exports.getUser = async (req, res, next) => {
    req.data = {};
    if (req.session.userId){
        let userId = req.session.userId;
        let user = await User.findById(userId);
        req.data.user = user;
    }
    next();
};


const { User } = require('./models');

module.exports.checkRegAccount = async (req, res, next) => {
    let userId = req.query.id;
    let user = await User.findById(userId);
    if (user){
        req.session.regAccountCreated = true;
        req.session.regUser = user._id;
        req.session.regSubPlan = user.subscriptionPlan;
        return next();
    }
    if (!req.session.regAccountCreated){
        return res.redirect('/signup');
    }
    next();
};

module.exports.checkAuth = (req, res, next) => {
    let user = req.data.user;
    if (!req.session.authenticated || !user){
        return res.redirect('/signin');
    }
    if (!user.member){
        let userId = user._id.toString();
        return res.redirect('/signup/regstep2?id=' + userId);
    }
    next();
};
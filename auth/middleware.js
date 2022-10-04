const { User } = require('./models');

const protectedRoutes = [
    '/signup/regstep2',
    '/signup/chooseplan',
    '/signup/regstep3',
    '/signup/creditoption',
];

module.exports.checkRegAccountMiddleware = async (req, res, next) => {
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

module.exports.checkAuthMiddleware = (req, res, next) => {
    let user = req.data.user;
    if (!req.session.authenticated || !user){
        console.log('not authenticated');
        return res.redirect('/signin');
    }
    if (!user.member){
        console.log('not a member');
        let userId = user._id.toString();
        return res.redirect('/signup/regstep2?id=' + userId);
    }
    next();
};

module.exports.routeProtectionMiddleware = (req, res, next) => {
    let isProtected = false;
    for (let route of protectedRoutes){
        if (req.path.startsWith(route)){
            isProtected = true;
            break;
        }
    }

    if (isProtected){
        return exports.checkRegAccountMiddleware(req, res, next);
    }
    
    next();
};
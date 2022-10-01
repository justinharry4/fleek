const { body } = require('express-validator');

module.exports.signupRegform = [
    body('email', 'Please enter a valid email')
        .isEmail(),
    body('password', 'Password must be between 4 to 24 characters')
        .isLength({ min: 4, max: 24})
]

module.exports.signupPlanform = [
    body('subPlan', 'Please choose a valid subscription plan')
        .isLength({min: 5})
        .custom((value) => {
            let subPlanList = ['basic', 'mobile', 'standard', 'premium'];
            if (!subPlanList.includes(value)){
                throw new Error('Please choose a valid subscription plan');
            } 
            return true;
        })
]
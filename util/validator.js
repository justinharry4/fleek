const { body } = require('express-validator');

module.exports.signup = [
    body('email', 'Please enter a valid email')
        .isEmail(),
    body('password', 'Password must be between 4 to 24 characters')
        .isLength({ min: 4, max: 24})
]


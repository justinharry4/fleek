const fs = require('fs');

const { ROOTDIR, dirExists } = require('../core/utils/file');

// register app features by adding feature name to the 'FEATURES' array.

const FEATURES = [
    'core',
    'auth',
    'profiles',
    'content',
]

for (let feature of FEATURES){
    if (!dirExists(feature, ROOTDIR)){
        throw new Error(`feature directory '${feature}' does not exist.`);
    }
}

module.exports = FEATURES;
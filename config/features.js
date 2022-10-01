const fs = require('fs');

const { ROOTDIR } = require('../core/utils/file');

// register app features by adding feature name to the 'FEATURES' array.

const FEATURES = [
    'core',
    'auth',
    'profiles',
    'content',
]

let rootContents = fs.readdirSync(ROOTDIR);

for (let feature of FEATURES){
    if (!rootContents.includes(feature)){
        throw new Error(`feature directory '${feature}' does not exist.`);
    }
}

module.exports = FEATURES;
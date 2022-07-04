const fs = require('fs');
const path = require('path');

// All paths in this application are constructed from the root directory

const ROOTDIR = process.cwd();

function loadFile(filePath){
    let pathLevels = filePath.split('/');
    let fullPath = path.join(ROOTDIR, ...pathLevels);
    let promise = fs.promises.readFile(fullPath, 'utf-8');

    return promise;
}

function makePath(filePath){
    let pathLevels = filePath.split('/');
    let fullPath = path.join(ROOTDIR, ...pathLevels); 

    return fullPath;
}

function writeFile(filePath, data){
    let fullPath = makePath(filePath);
    let promise = fs.promises.writeFile(fullPath, data);
    return promise;
}

module.exports.ROOTDIR = ROOTDIR;
module.exports.loadFile = loadFile;
module.exports.makePath = makePath;
module.exports.writeFile = writeFile;
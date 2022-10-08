const fs = require('fs');
const path = require('path');

// All paths in this application are constructed from the root directory

const ROOTDIR = getProjectRoot();

function getProjectRoot(){
    let projectRoot;
    let entryFile = 'app.js';
    let currentPath = __dirname;

    while (!projectRoot) {
        if (fs.readdirSync(currentPath).includes(entryFile)){
            projectRoot = currentPath;
        }
        currentPath = path.join(currentPath, '..');
    }

    return projectRoot;
}

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

function dirExists(dirName, parentDir){
    let dirContents = fs.readdirSync(parentDir);

    if (dirContents.includes(dirName)){
        return true;
    }
    return false;
}


module.exports = {
    ROOTDIR,
    loadFile,
    makePath,
    writeFile,
    dirExists,
}
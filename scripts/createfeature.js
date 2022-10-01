const fs = require('fs');
const path = require('path');


const FLAGS = {
    MULTIPLE: 'm',
    OMIT: 'o',
}

function parseArgs(){
    let lowerCaseAlphabet = 'abcdefghijklmnopqrstuvwxyz';

    let cliArgs = process.argv.slice(2);

    let args = cliArgs.filter(arg => {
        return lowerCaseAlphabet.includes(arg[0].toLowerCase());
    });

    if (args.length === 0){
        throw new Error('pass in one or more feature names.');
    }

    let rawFlags = cliArgs.filter(arg => arg.startsWith('-'));
    let flags = rawFlags.map(flag => flag.slice(1));

    let invalidArgs = cliArgs.filter(arg => {
        let isArg = args.includes(arg);
        let isFlag = rawFlags.includes(arg);

        return !isArg && !isFlag;
    });

    if (invalidArgs.length > 0){
        throw new Error(`Invalid arguments \`${invalidArgs.join(', ')}\` were passed.`);
    }

    return { args, flags };
}

function validateFlags(args, flags){
    for (let flag of flags){
        let flagValues = Object.values(FLAGS);

        if (!flagValues.includes(flag)){
            let validFlags = flagValues.join(', ');
            throw new Error(`invalid flag -${flag}. Try -${validFlags}.`);
        }
    }

    if (args.length > 1 && !flags.includes(FLAGS.MULTIPLE)){
        throw new Error(`use the -${FLAGS.MULTIPLE} flag to pass in multiple feature names.`);
    }
}

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

function createFeature(featureNames, flags){
    let projectRoot = getProjectRoot();
    let createdFeatures = [];
    
    for (let featureName of featureNames){
        let featurePath = path.join(projectRoot, featureName);

        if (fs.existsSync(featurePath)){
            console.log(featurePath)
            console.log(`a directory named '${featureName}' already exists.`);
            continue
        }

        let viewsPath = path.join(featurePath, 'views');
        let subViewsPath = path.join(viewsPath, featureName);
        let publicPath = path.join(featurePath, 'public');
        let cssPath = path.join(publicPath, 'css');
        let jsPath = path.join(publicPath, 'js');

        let dirPaths = [featurePath, viewsPath, subViewsPath, publicPath, cssPath, jsPath];

        let controllersPath = path.join(featurePath, 'controllers.js');
        let modelsPath = path.join(featurePath, 'models.js');
        let routesPath = path.join(featurePath, 'routes.js');

        let filePaths = [controllersPath, modelsPath, routesPath];

        if (!flags.includes(FLAGS.OMIT)){
            for (let dirPath of dirPaths){
                fs.mkdirSync(dirPath);
            }
        }

        for (let filePath of filePaths){
            fs.writeFileSync(filePath, '');
        }

        createdFeatures.push(featureName);
    }

    if (createdFeatures.length > 0){
        console.log(
            'successfully created feature(s): ' + createdFeatures.join(', ') + '.'
        )

        let configPath = path.join(projectRoot, 'config');
        if (!fs.existsSync(configPath)){
            fs.mkdirSync(configPath);
        }

        let featuresPath = path.join(configPath, 'features.js');
        if (!fs.existsSync(featuresPath)){
            fs.writeFileSync(featuresPath, '');
        } 
    }
}

function startScript(){
    try {
        let { args, flags } = parseArgs();

        validateFlags(args, flags);

        createFeature(args, flags);
    } catch(error) {
        console.log('An error occured while creating feature(s):');
        console.log('ERR_MESSAGE: ' + error.message);
    }
}

startScript();
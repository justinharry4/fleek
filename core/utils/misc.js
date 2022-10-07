function lowerCaseHyphenate(str){
    const lowerCaseAlphabet = 'abcdefghijklmnopqrstuvwxyz';
    
    str = String(str);

    let stringSet = lowerCaseAlphabet + '-';

    let lowerCaseStr = str.toLowerCase();
    let hyphenatedStr = lowerCaseStr.split(' ').join('-');
    let strArray = hyphenatedStr.split('');

    strArray.forEach((char, index) => {
        if (!(stringSet.includes(char))){
            strArray[index] = ''
        }
    });

    let result = strArray.join('');

    return result;
}

function isAsync(func){
    return func.constructor.name === 'AsyncFunction';
}

module.exports = { isAsync, lowerCaseHyphenate };




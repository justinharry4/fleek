const lowerCaseAlphabet = 'abcdefghijklmnopqrstuvwxyz';

function lowerCaseHyphenate(str){
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

module.exports.lowerCaseHyphenate = lowerCaseHyphenate
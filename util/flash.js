function getFlashMsg(req){
    let flashObject = req.flash()
    let messages = {};
    for (let key in flashObject){
        if (flashObject[key].length > 0){
            if (key === 'formData'){
                messages[key] = JSON.parse(flashObject[key][0])
            } else {
                messages[key] = flashObject[key][0];
            }
        } else {
            messages[key] = null;
        }
    }
    return messages;
}

module.exports.getFlashMsg = getFlashMsg;

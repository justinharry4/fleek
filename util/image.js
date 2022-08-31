const sharp = require('sharp');
const axios = require('axios');

async function isFullyOpaque(source){
    let isUrl = source.startsWith('http');

    try {
        let image;

        if (isUrl){
            let response = await axios.get(source, {
                responseType: 'stream',
            });

            let imageStream = response.data;
            let sharpStream = sharp();
            imageStream.pipe(sharpStream);

            image = sharpStream;
        } else {
            image = sharp(source);
        }

        let imageData = await image.stats();
        
        return imageData.isOpaque;
    } catch(error){
        throw error;
    }

}

module.exports.isFullyOpaque = isFullyOpaque;
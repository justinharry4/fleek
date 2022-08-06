import { PageManager, addListener } from '../modules/page.js';

let source = '/scripts/content/browse.js';
let mainFragmentName = 'browse';

$(initializePage);

function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/browse');
    }

    setEventHandlers();

    PageManager.triggerInitWindowEvents(
        mainFragmentName,
        page,
        showPageInHistory,
        setEventHandlers,
    );

    loadPosters();
}

// POPSTATE EVENT HANDLER
async function showPageInHistory(page){
    try {
        await PageManager.showHistory(page, '#toplevel-container');
    } catch(error){
        throw error;
    }
}

// UTILITY FUCTIONS
async function loadPosters(){
    let $posterImages = $('.poster-wrapper img');

    let reloadTime = 40;

    let reloadImage = async function (imgElement, relTime, resolve){
        let src = $(imgElement).attr('src');
        let alt = $(imgElement).attr('alt');
        
        setTimeout(async () => {
            let $newImage = $('<img>');
            $newImage.attr('src', src).attr('alt', alt);
            $(imgElement).replaceWith($newImage);

            let newImg = $newImage.get(0)
            try {
                await newImg.decode()
                resolve('Image Reload Sucessful');
            } catch(error){
                reloadTime = reloadTime * 2
                reloadImage(newImg, reloadTime, resolve)
            }
        }, relTime);
    }

    for (let imgElement of $posterImages.get()){
        let success;
        try {
            // let src = $(imgElement).data('src');
            // $(imgElement).attr('src', src);
            await imgElement.decode();
            success = 'Initial Image Load Successful';
        } catch(error){
            let timeoutID;
            let promise = new Promise((resolve, reject) => {
                reloadImage(imgElement, reloadTime, resolve);
                timeoutID = setTimeout(() => reject('image load timed out'), 30000);
            })
            success = await promise;
            clearTimeout(timeoutID);
        }

        console.log(success);
        // $(imgElement).on('error', {reloadTime: reloadTime}, triggerImageReload)
        // let src = $(imgElement).data('src');
        // $(imgElement).attr('src', src);
    }

    console.log(reloadTime);
}

// SET EVENT HANDLERS
async function setEventHandlers(){
    let $topImage = $('.topContent-poster');
    let $profileImage = $('.profile-photo');
    let $lastImage = $('.poster-wrapper img').last();
    let $image = $('<img>');
    $image.attr('src', '/images/def-profile-photo.png');

    // setTimeout(async () => {
    //     try {
    //         let result = await $lastImage.get(0).decode();
    //         console.log('decode result =>', result);
    //     } catch(error){
    //         console.log(error);
    //     }
    // }, 10000);
    // let img = new HTMLImageElement();
    // img.decode
}

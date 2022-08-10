import { PageManager, addListener } from '../modules/page.js';
import { createSettingsBox } from './fragments/browse.js';

let source = '/js/content/browse.js';
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

    PageManager.triggerInitWindowEvents(
        mainFragmentName,
        page,
        showPageInHistory,
        setEventHandlers,
    );

    setEventHandlers();
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
// page initialization
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

    for (let [index, imgElement] of $posterImages.get().entries()){
        if (index >= 30){
            let $topDiv = $('#toplevel-container');
            if ($topDiv.hasClass('loading')){
                $topDiv.removeClass('loading');
                $('#onload-cover').remove();
                console.log('loaded!');
            }
        }
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
        // console.log(success);
    }
}

// misc utilities
function getTime(durationStr){
    let durationMs;
    if (durationStr.includes('s')){
        let numStr = durationStr.slice(0, -1);
        durationMs = parseFloat(numStr) * 1000;
    }
    if (durationStr.includes('ms')){
        let numStr = durationStr.slice(0, -2);
        durationMs = parseFloat(numStr);
    }

    return durationMs;
}

// event handler helpers
function setScrollCheckInterval(eventData){
    setInterval(() => {
        let $header = $('header');
        if (eventData.scrolled){
            if (!$header.hasClass('scrolled')){
                $header.addClass('scrolled');
            }
        } else {
            if ($header.hasClass('scrolled')){
                $header.removeClass('scrolled');
            }
        }
    }, 300);
}

function showOptionPopup(optionDiv, wrapperSelector){
    let $popup = $(optionDiv).find(wrapperSelector);

    $popup.removeClass('off-screen');
    $popup.addClass('visible');
}

function clearOptionPopup(optionDiv, wrapperSelector, event){
    let $popup = $(optionDiv).find(wrapperSelector);
    $popup.removeClass('visible');

    let durationStr = $popup.css('transition-duration');
    let duration = getTime(durationStr);

    setTimeout(() => {
        let $wrapper = $(optionDiv).find(wrapperSelector + ':hover');
        let isHover = $wrapper.length > 0;
        if (!isHover){
            $popup.addClass('off-screen');
        }
    }, duration);
}

function toggleOptionPopup(optionDiv, wrapperSelector, event){
    let $popup = $(optionDiv).find(wrapperSelector);

    if ($popup.hasClass('visible')){
        let popupRect = $popup.get(0).getBoundingClientRect();
        let withinX = popupRect.left <= event.clientX && event.clientX <= popupRect.right;
        let withinY = popupRect.top <= event.clientY && event.clientY <= popupRect.bottom;

        if (!(withinX && withinY)){
            clearOptionPopup(optionDiv, wrapperSelector, event);
        }
    } else {
        showOptionPopup(optionDiv, wrapperSelector);
    }
}

// SET EVENT HANDLERS
async function setEventHandlers(){
    let scrollEventData = { scrolled: false};
    addListener(window, 'scroll', setDocumentScrollFlag, scrollEventData);
    setScrollCheckInterval(scrollEventData);

    let $notificationsDiv = $('.notifications-option');
    addListener($notificationsDiv, 'click', toggleNotificationsBox);
    addListener($notificationsDiv, 'mouseenter', showNotificationsBox);
    addListener($notificationsDiv, 'mouseleave', clearNotificationsBox);

    let $settingsDiv = $('.settings-option');
    addListener($settingsDiv, 'click', toggleSettingsBox);
    addListener($settingsDiv, 'mouseenter', showSettingsBox);
    addListener($settingsDiv, 'mouseleave', clearSettingsBox);

    let otherProfilesLi = $('.settings-wrapper .otherProfiles-list li');
    addListener(otherProfilesLi, 'click', switchProfile);
}

// EVENT HANDLERS
function setDocumentScrollFlag(e){
    if (window.scrollY > 0){
        e.data.scrolled = true;
    } else {
        e.data.scrolled = false;
    }
}

function showNotificationsBox(e){
    showOptionPopup(this, '.notifications-wrapper');
}

function clearNotificationsBox(e){
    clearOptionPopup(this, '.notifications-wrapper', e);
}

function toggleNotificationsBox(e){
    toggleOptionPopup(this, '.notifications-wrapper', e);
}

function showSettingsBox(e){
    showOptionPopup(this, '.settings-wrapper');
}

function clearSettingsBox(e){
    clearOptionPopup(this, '.settings-wrapper', e);
}

function toggleSettingsBox(e){
    toggleOptionPopup(this, '.settings-wrapper', e);
}

function switchProfile(e){
    
}
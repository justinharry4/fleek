/* BUG FIXES TO BE MADE:
    1. overlap of neighbouring elements on `.minContentInfo` popups
    2. `.minContentInfo` popups when in scrollbar region
*/

import { PageManager, addListener } from '../modules/page.js';
import { getMinContentInfoStr, getFullContentInfoStr } from './fragments/browse.js';

let source = '/js/content/browse.js';
let mainFragmentName = 'browse';

$(initializePage);

// PAGE INITIALIZATION
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

async function loadPosters(){
    let $posters = $('.poster-wrapper div.poster');

    let reloadTime = 40;

    let reloadImage = async function (posterDiv, relTime, resolve){
        let src = $(posterDiv).data('src');
        
        setTimeout(async () => {
            $(posterDiv).css({
                'background-image': 'url(' + src + ')',
            });
            let $image = $('<img>');
            $image.attr('src', src);
            
            try {
                await $image.get(0).decode()

                let $logoImg = $(posterDiv).find('.logo');
                try {
                    await $logoImg.get(0).decode();
                    $logoImg.removeClass('missing');
                } catch (error){
                    $logoImg.addClass('missing');
                }

                resolve('Image Reload Sucessful');
            } catch(error){
                reloadTime = reloadTime * 2
                reloadImage(posterDiv, reloadTime, resolve)
            }
        }, relTime);
    }

    for (let [index, posterDiv] of $posters.get().entries()){
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
            let src = $(posterDiv).data('src');

            $(posterDiv).css({
                'background-image': 'url(' + src + ')',
            });
            let $img = $('<img>');
            $img.attr('src', src);
            await $img.get(0).decode();

            let $logoImg = $(posterDiv).find('.logo');
            try {
                await $logoImg.get(0).decode();
            } catch (error){
                $logoImg.addClass('missing');
            }

            success = 'Initial Image Load Successful';
        } catch(error){
            let timeoutID;
            let promise = new Promise((resolve, reject) => {
                reloadImage(posterDiv, reloadTime, resolve);
                timeoutID = setTimeout(() => reject('image load timed out'), 30000);
            });

            try {
                success = await promise;
                clearTimeout(timeoutID);
            } catch (error){
                console.log('PAGE LOAD ERR', error);
            }
        }
        console.log(index, success);
    }
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

function toDurationString(length){
    length = parseFloat(length);

    let exactHours = length / 60;
    let fractionalHours = exactHours % 1;
    let minutes = Math.round(fractionalHours * 60);
    let hours = exactHours - fractionalHours;

    let hourStr = hours ? hours + 'h ' : '';
    let minuteStr = minutes ? minutes + 'm' : '';

    return hourStr + minuteStr;
}

function mouseInElement(coordinates, element){
    let rect = element.getBoundingClientRect();
    let withinX = rect.left <= coordinates.clientX && coordinates.clientX <= rect.right;
    let withinY = rect.top <= coordinates.clientY && coordinates.clientY <= rect.bottom;

    if (withinX && withinY){
        return true;
    } else {
        return false;
    }
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

function setMouseCheckInterval(eventData){
    setInterval(() => {
        let $wrappers = $('.poster-wrapper > div:first-of-type');
        let selectedWrapper;

        $wrappers.each((index, element) => {
            if (mouseInElement(eventData, element)){
                if (!selectedWrapper){
                    // check for overlap in neighbouring elements 
                    selectedWrapper = element;
                }
            } else {
                let posterWrapper = $(element).parent().get(0);
                hideMinContentInfo(posterWrapper);
            }
        });

        if (selectedWrapper){
            let selectedPosterWrapper = $(selectedWrapper).parent().get(0);
            showMinContentInfo(selectedPosterWrapper);
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

async function showMinContentInfo(posterWrapper){
    let $contentInfoDiv = $(posterWrapper).find('.minContentInfo-wrapper');

    if (!($(posterWrapper).hasClass('min-content'))){
        $(posterWrapper).addClass('min-content');
        try {
            let contentId = $(posterWrapper).data('contentid');
            let resData = await $.get('/content/' + contentId);
            let contentDoc = resData.contentDoc;

            let contentLength;
            let length = contentDoc.durationMins;
            let totalSeasons = contentDoc.seasonCount;
            if (length){
                contentLength = toDurationString(length);
            } else if (totalSeasons){
                contentLength = totalSeasons + ' Season';
                if (parseInt(totalSeasons) > 1){
                    contentLength += 's';
                }
            } else {
                contentLength = '';
            }
            
            let genres = contentDoc.genres;

            $contentInfoDiv = $(getMinContentInfoStr());

            $contentInfoDiv.find('.contentLength').text(contentLength);
            genres.forEach((genre) => {
                $contentInfoDiv.find('.genres-wrapper').append(`<li>${genre}</li>`);
            })

            let svgUrls = [
                '/images/svg/play.svg',
                '/images/svg/plus.svg',
                '/images/svg/like5.svg',
                '/images/svg/next-button.svg',
            ];
            let svgElements = [];

            for (let url of svgUrls){
                let svgDoc = await $.get(url);
                let $svgElement = $(svgDoc).find('svg');
                svgElements.push($svgElement);
            }

            svgElements.forEach((svgElement, index) => {
                let $contentInfoButtons = $contentInfoDiv.find('.minContentInfo-button');
                $($contentInfoButtons.get(index)).append(svgElement);
            });

            let wrapperDiv = $(posterWrapper).find('> div:first-of-type');
            wrapperDiv.append($contentInfoDiv);
        } catch(error) {
            console.log('An error occured', error);
        }
    }

    $contentInfoDiv.removeClass('hidden');
    $(posterWrapper).addClass('expand')
}

function hideMinContentInfo(posterWrapper){
    let $contentInfoDiv = $(posterWrapper).find('.minContentInfo-wrapper');

    $(posterWrapper).removeClass('expand min-content');
    if ($contentInfoDiv.length > 0){
        $contentInfoDiv.remove();
    }
}

// SET EVENT HANDLERS
async function setEventHandlers(){
    // throttled events
    let scrollEventData = { scrolled: false};
    addListener(window, 'scroll', setDocumentScrollFlag, scrollEventData);
    setScrollCheckInterval(scrollEventData);

    let mousemoveEventData = { clientX: -1, clientY: -1 };
    addListener(window, 'mousemove', setMouseCoordinates, mousemoveEventData);
    setMouseCheckInterval(mousemoveEventData);

    // regular events
    let $notificationsDiv = $('.notifications-option');
    addListener($notificationsDiv, 'click', toggleNotificationsBox);
    addListener($notificationsDiv, 'mouseenter', showNotificationsBox);
    addListener($notificationsDiv, 'mouseleave', clearNotificationsBox);

    let $settingsDiv = $('.settings-option');
    addListener($settingsDiv, 'click', toggleSettingsBox);
    addListener($settingsDiv, 'mouseenter', showSettingsBox);
    addListener($settingsDiv, 'mouseleave', clearSettingsBox);

    let $otherProfilesLi = $('.settings-wrapper .otherProfiles-list li');
    addListener($otherProfilesLi, 'click', switchProfile);

    let $manageProfileDiv = $('.manageProfiles-wrapper');
    addListener($manageProfileDiv, 'click', getManageProfiles);

    let $signoutDiv = $('.settings-wrapper #signout-div');
    addListener($signoutDiv, 'click', signout);

    let $contentInfoWrappers = $('.poster-wrapper > div:first-of-type');
    addListener($contentInfoWrappers, 'click', showFullContentInfo);
}

function setMinInfoEventHandlers(){

}

function setFullInfoEventHandlers(){
    let $closeButton = $('.fullContentInfo-wrapper .close-button');
    addListener($closeButton, 'click', closeFullContentPopup);
}

// EVENT HANDLERS
function setDocumentScrollFlag(e){
    if (window.scrollY > 0){
        e.data.scrolled = true;
    } else {
        e.data.scrolled = false;
    }
}

function setMouseCoordinates(e){
    e.data.clientX = e.clientX;
    e.data.clientY = e.clientY;
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

async function switchProfile(e){
    let url = '/switchprofile';
    let profileId = $(this).data('profileid')
    let requestData = { profileId: profileId };

    try {
        await $.post(url, requestData);

        location.assign('/browse');
    } catch(jqXHR){
        PageManager.showError();
    }
}

async function getManageProfiles(e){
    let url = '/manageprofiles';

    try {
        await $.get(url);

        location.assign(url);
    } catch(error){
        PageManager.showError();
    }
}

async function signout(e){
    try {
        await $.post('/signout');

        location.assign('/signin');
    } catch(error){
        PageManager.showError();
    }
}

async function showFullContentInfo(e){
    let $posterWrapper = $(this).parent();
    let contentId = $posterWrapper.data('contentid');

    try {
        let resData = await $.get('/content/' + contentId);
        let contentDoc = resData.contentDoc;

        let releaseYear = contentDoc.releaseYear || contentDoc.firstAirYear;
        releaseYear = releaseYear || '';

        let contentLength;
        let length = contentDoc.durationMins;
        let totalSeasons = contentDoc.seasonCount;
        if (length){
            contentLength = toDurationString(length);
        } else if (totalSeasons){
            contentLength = totalSeasons + ' Season';
            if (parseInt(totalSeasons) > 1){
                contentLength += 's';
            }
        } else {
            contentLength = '';
        }

        let genres = contentDoc.genres.join(', ');
        let overview = contentDoc.overview || 'No overview available';
        let posterUrl = $(this).find('img').attr('src');

        let $fullContentInfoContainer = $(getFullContentInfoStr());

        $fullContentInfoContainer
            .find('.topPoster-wrapper .fullContent-poster')
            .attr('src', posterUrl);

        $fullContentInfoContainer
            .find('.contentInfo-wrapper .date-length-wrapper')
            .append(`<span>${releaseYear}</span>`)
            .append(`<span>${contentLength}</span>`);

        $fullContentInfoContainer
            .find('.contentInfo-wrapper .overview')
            .text(overview);

        $fullContentInfoContainer
            .find('.contentInfo-wrapper .genres-wrapper')
            .append(`<span>${genres}</span>`);

        let svgButtonUrls = [
            'images/svg/play.svg',
            'images/svg/plus.svg',
            'images/svg/like5.svg',
        ]

        let svgElements = [];
        for (let url of svgButtonUrls){
            let svgDoc = await $.get(url);
            let $svgElement = $(svgDoc).find('svg');
            svgElements.push($svgElement);
        }
        
        let $buttons = $fullContentInfoContainer.find('.topPoster-wrapper button');
        svgElements.forEach((svgElement, index) => {
            let $button = $($buttons.get(index));
            $button.append(svgElement);
            if ($button.hasClass('play-button')){
                $button.append('<span>Play</span>');
            }
        });

        let $similarContentPostersWrapper = $fullContentInfoContainer
            .find('.similarContent-wrapper .posters-wrapper');

        for (let i=1; i<=6; i++){
            $similarContentPostersWrapper
                .append('<div class="similarContentInfo-wrapper"></div>');
        }

        let closeSVGDoc = await $.get('/images/svg/plus.svg');
        let $closeSVGElement = $(closeSVGDoc).find('svg');
        $fullContentInfoContainer.find('.close-button').append($closeSVGElement);

        let $toplevelDiv = $('#toplevel-container');
        $toplevelDiv.append($fullContentInfoContainer);

        setFullInfoEventHandlers();
    } catch(error){
        console.log('an error occured', error);
    }
}

function closeFullContentPopup(e){
    let $fullContentInfoContainer = $(this).closest('.fullContentInfo-container');
    $fullContentInfoContainer.remove();
}
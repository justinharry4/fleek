import { PageManager, addListener } from '../modules/page.js';

let source = '/scripts/content/profiles.js';
let mainFragmentName = 'profiles';

$(initializePage);

// INITIALIZATION
function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager();
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container');
        setTimeout(() => $('#lowlevel-container').removeClass('zoom'), 1);
    }

    setEventHandlers();

    PageManager.triggerInitWindowEvents(
        mainFragmentName,
        page,
        showPageInHistory,
        setEventHandlers,
    );
}

// POPSTATE EVENT HANDLER
async function showPageInHistory(page){
    try {
        await PageManager.showHistory(page, '#toplevel-container');
    } catch(error){
        throw error;
    }
}

// UTILITY FUNCTIONS
function adjustAddProfileHoverState(){
    // let $addProfileWrapper = $('.add-profile-wrapper');
    // let $addProfileWrapperHover = $('.add-profile-wrapper:hover');

    // let $profileElement = $($addProfileWrapper.find('> *').get(0));
    // let isHighlighted = $profileElement.hasClass('highlight');
    // if ($addProfileWrapperHover.length === 0 && isHighlighted){
    //     $addProfileWrapper.trigger('mouseleave');
    // }

    let $profileWrappers = $('.profile-wrapper');

    $profileWrappers.each((index, element) => {
        let $profileWrapperHover = $(element).filter(':hover');
        let $profileElement = $($(element).find('> *').get(0));
        let isHighlighted = $profileElement.hasClass('highlight');
        if ($profileWrapperHover.length === 0 && isHighlighted){
            $(element).trigger('mouseleave');
        }

    })
}

// SET EVENT HANDLERS
function setEventHandlers(){
    let $allProfileWrappers = $('.profile-wrapper');
    addListener($allProfileWrappers, 'mouseenter', highlightProfile);
    addListener($allProfileWrappers, 'mouseleave', unhighlightProfile);

    let $addProfileWrapper = $('.add-profile-wrapper');
    addListener($addProfileWrapper, 'click', getAddProfile);

    let $profileWrappers = $allProfileWrappers.filter('[data-profile-id]');
    addListener($profileWrappers, 'click', getBrowse);

    adjustAddProfileHoverState();
}

// EVENT HANDLERS
function highlightProfile(e){
    let $profileElements = $(this).find('> *, svg path');
    let $profileImg = $(this).find('img');

    $profileElements.addClass('highlight');
    $profileImg.css({ borderRadius: '0px' })
}

function unhighlightProfile(e){
    let $profileElements = $(this).find('> *, svg path');
    let $profileImg = $(this).find('img');

    $profileElements.removeClass('highlight');
    $profileImg.css({ borderRadius: '4px' })
}

async function getAddProfile(e){
    try {
        let HTMLStr = await $.get('/profiles/addprofile');

        PageManager.loadPageFromHTML(
            HTMLStr,
            '#toplevel-container',
            mainFragmentName
        );
    } catch (jqXHR){
        console.log('FAIL', jqXHR);
    }
}

async function getBrowse(e){
    try {
        let profileId = $(this).data('profile-id');
        let HTMLStr = await $.get('/browse', {profileId: profileId});
        
        PageManager.loadPageFromHTML(
            HTMLStr,
            '#toplevel-container',
            '/profiles/languagesetup',
            mainFragmentName,
        );
    } catch(jqXHR){
        console.log('FAIL', jqXHR);
    }
}
import { PageManager, addListener } from '/js/core/page.js';

let source = '/js/profiles/manage-profiles.js';
let mainFragmentName = 'manageProfiles';

$(initializePage);

// INITIALIZATION
function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/manageprofiles');
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
    addListener($profileWrappers, 'click', getEditProfile);

    let $doneButton = $('.done-button');
    addListener($doneButton, 'click', exitManageProfiles);

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

function exitManageProfiles(e){
    history.back()
}

async function getAddProfile(e){
    try {
        let HTMLStr = await $.get('/profiles/addprofile');

        PageManager.loadPageFromHTML(
            HTMLStr,
            '#toplevel-container',
            mainFragmentName,
            true,
            '/profiles/addprofile',
            '/profiles/addprofile',
        );
    } catch (jqXHR){
        console.log('FAIL', jqXHR);
    }
}

async function getEditProfile(e){
    let profileId = $(this).data('profile-id');
    let requestData = { profileId: profileId }

    try {
        let url = '/profiles/editprofile'
        let HTMLStr = await $.get(url, requestData);
        
        PageManager.loadPageFromHTML(
            HTMLStr,
            '#toplevel-container',
            mainFragmentName,
            false,
        );
    } catch(jqXHR){
        console.log('FAIL', jqXHR)
    }
}
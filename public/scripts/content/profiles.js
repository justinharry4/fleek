import { PageManager } from '../modules/page.js';

let source = '/scripts/content/profiles.js';
let mainFragmentName = 'profiles';

$(initializePage);

// INITIALIZATION
function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    console.log('FMETHOD', fetchMethod);

    let page = new PageManager();
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#lowlevel-container');
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
    console.log('profiles history')

    try {
        await PageManager.showHistory(page, '#lowlevel-container');
    } catch(error){
        throw error;
    }
}

// UTILITY FUNCTIONS
function adjustAddProfileHoverState(){
    let $addProfileWrapper = $('.add-profile-wrapper');
    let $addProfileWrapperHover = $('.add-profile-wrapper:hover');

    let $profileElement = $($addProfileWrapper.find('> *').get(0));
    let isHighlighted = $profileElement.hasClass('highlight');
    if ($addProfileWrapperHover.length === 0 && isHighlighted){
        $addProfileWrapper.trigger('mouseleave');
    }
}

// SET EVENT HANDLERS
function setEventHandlers(){
    let $profileWrappers = $('.profile-wrapper');
    $profileWrappers.off('mouseenter mouseleave');
    $profileWrappers.on('mouseenter', highlightProfile);
    $profileWrappers.on('mouseleave', unhighlightProfile);

    let $addProfileWrapper = $('.add-profile-wrapper');
    $addProfileWrapper.off('click');
    $addProfileWrapper.on('click', showAddProfile);

    adjustAddProfileHoverState();

    console.log('profiles handlers set')
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

async function showAddProfile(e){
    try {
        let htmlData = await $.get('/profile/addprofile');
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlData, 'text/html');

        let $lowDiv = $(htmlDoc).find('#lowlevel-container');
        let $styleSheetLinks = $(htmlDoc).find('link[rel="stylesheet"]');
        let $scripts = $(htmlDoc).find('script');

        let stateElements = { 
            containerDiv: $lowDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts
        };

        let $eventGateElement = $('<div>');

        $eventGateElement.on('customSendPage:', async (e) => {
            let page = e.eventData.page;
            try {
                await page.loadPage(
                    stateElements,
                    '#lowlevel-container',
                    'ajax',
                    true
                );
            } catch(error){
                console.log(error.message);
                PageManager.showPageLoadError(error.message);
            }
        });

        let requestPageEvent = $.Event('customRequestPage:');
        requestPageEvent.eventData = {
            element: $eventGateElement,
            fragmentName: mainFragmentName
        };

        $(window).trigger(requestPageEvent);
    } catch (jqXHR){
        console.log('FAIL', jqXHR);
    }
}


import { PageManager, addListener, ajax } from '/js/page.js';

let source = '/js/delete-profile.js';
let mainFragmentName = 'deleteProfile';

$(initializePage);

// INITIALIZATION
function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/deleteprofile');
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

function setPageScroll(){
    let $toplevelDiv = $('#toplevel-container');
    let $lowlevelDiv = $('#lowlevel-container');
    
    let intervalID = setInterval(() => {
        let trans = $lowlevelDiv.css('transform');
        if (trans === 'none'){
            $toplevelDiv.removeClass('no-scroll');
            clearTimeout(intervalID);
        }
    }, 100);
}

// POPSTATE EVENT HANDLER
async function showPageInHistory(page){
    try {
        await PageManager.showHistory(page, '#toplevel-container');
    } catch(error){
        throw error;
    }
}

// SET EVENT HANDLERS
function setEventHandlers(){
    let $cancelButton = $('.actions-wrapper .cancel-button');
    addListener($cancelButton, 'click', exitDeleteProfile);

    let $deleteProfileForm = $('.deleteProfile-form');
    addListener($deleteProfileForm, 'submit', submitDeleteProfileForm);

    setPageScroll();
}

// EVENT HANDLERS
async function exitDeleteProfile(e){
    let url = '/profiles/editprofile';
    let requestData = $(this).closest('form').serialize();

    try {
        let { resData } = await ajax.get(url, requestData);

        PageManager.loadPageFromHTML(
            resData,
            '#toplevel-container',
            mainFragmentName,
            false,
        );
    } catch({ jqXHR }){
        console.log('FAIL', jqXHR);
    }
}

async function submitDeleteProfileForm(e){
    e.preventDefault();

    let url = $(this).attr('action');
    let requestData = $(this).serialize()

    try {
        let { jqXHR, resData } = await ajax.post(url, requestData);

        let resourceLocation = jqXHR.getResponseHeader('Resource-Location');

        PageManager.loadPageFromHTML(
            resData, 
            '#toplevel-container',
            mainFragmentName,
            true,
            '/manageprofiles',
            resourceLocation,
        );
    } catch({ jqXHR }){
        console.log('FAIL', jqXHR);
    }
}
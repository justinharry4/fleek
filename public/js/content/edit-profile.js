import { PageManager, addListener, ajax } from '../modules/page.js';
import { checkboxInit } from '../components/checkbox.js';

let source = '/js/content/edit-profile.js';
let mainFragmentName = 'editProfile';

$(initializePage);

// INITIALIZATION
function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/editprofile');
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
    let $editProfileForm = $('.editProfile-form');
    addListener($editProfileForm, 'submit', submitEditProfileForm);

    let $cancelButton = $('.actions-wrapper .cancel-button');
    addListener($cancelButton, 'click', exitEditProfile);

    let $deleteButton = $('.actions-wrapper .delete-button');
    addListener($deleteButton, 'click', getDeleteProfile);

    setPageScroll();
    checkboxInit();
}

// EVENT HANDLERS
function exitEditProfile(e){
    history.back();
}

async function submitEditProfileForm(e){
    e.preventDefault();

    let $textInput = $(this).find('input[name="profileName"]');

    if ($textInput.val().length > 0){
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
                '/profiles/manageprofiles',
                resourceLocation,
            );
        } catch({ jqXHR }){
            console.log('FAIL', jqXHR);
        }
    }
}
 
async function getDeleteProfile(e){
    let $profileIdInput = $('.editProfile-form input[name="profileId"]');
    let profileId = $profileIdInput.val();

    let url = '/profiles/deleteprofile';
    let requestData = { profileId: profileId }
    try {
        let { jqXHR, resData } = await ajax.get(url, requestData);

        let resourceLocation = jqXHR.getResponseHeader('Resource-Location');

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


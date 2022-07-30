import { PageManager, addListener } from '../modules/page.js';
import { checkboxInit } from '../components/checkbox.js';

let source = '/scripts/content/add-profile.js';
let mainFragmentName = 'addProfile';

$(initializePage);

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

// SET EVENT HANDLERS
function setEventHandlers(){
    let $profileNameInput = $('.profile-form input[type="text"]');
    addListener($profileNameInput, 'input', highlightContinueButton);

    let $cancelButton = $('.cancel-button');
    addListener($cancelButton, 'click', exitAddProfile);

    let $continueButton = $('.continue-button');
    addListener($continueButton, 'click', submitProfileForm);

    let $checkboxLabel = $('.kidCheckbox-label');
    addListener($checkboxLabel, 'mouseenter', showLabelHint);
    addListener($checkboxLabel, 'mouseleave', clearLabelHint);

    checkboxInit();
}

// EVENT HANDLERS
function exitAddProfile(e){
    history.back();
}

function highlightContinueButton(e){
    let $continuButton = $('.continue-button');
    let userInput = $(this).val();

    if (userInput.length > 0){
        $continuButton.addClass('ready');
    } else {
        $continuButton.removeClass('ready');
    }
}

async function submitProfileForm(e){
    let $profileForm = $('.profile-form');
    let $textInput = $profileForm.find('input[type="text"]');
    let $checkbox = $profileForm.find('input[type="checkbox"]');

    if ($textInput.val().length > 0){
        let url = $profileForm.attr('action');
        let requestData = {};
        let textInputName = $textInput.attr('name');
        let checkboxName = $checkbox.attr('name');
        let checkValue = ($checkbox.get(0).checked) ? $checkbox.val(): 'no-kid';

        requestData[textInputName] = $textInput.val();
        requestData[checkboxName] = checkValue;

        try {
            let HTMLStr = await $.post(url, requestData);
            
            PageManager.loadPageFromHTML(
                HTMLStr,
                '#toplevel-container',
                mainFragmentName
            );
        } catch(jqXHR){
            console.log(jqXHR);
            let message = 'The requested action could not be completed.'
            PageManager.showError(message);
        }
    }
}

function showLabelHint(e){
    let $labelHint = $('.kidLabelHint');
    $labelHint.addClass('visible');
}

function clearLabelHint(e){
    let $labelHint = $('.kidLabelHint');
    $labelHint.removeClass('visible');
}




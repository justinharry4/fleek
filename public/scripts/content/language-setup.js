import { PageManager, addListener } from '../modules/page.js';
import { checkboxInit } from '../components/checkbox.js';

let source = '/scripts/content/language-setup.js';
let mainFragmentName = 'languageSetup';

$(initializePage);

function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/profiles/languagesetup');
        setTimeout(() => $('#lowlevel-container').removeClass('offScreenRight'), 1);
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
    let $nextButton = $('.next-button');
    addListener($nextButton, 'click', submitLanguagesForm);

    let $languagesForm = $('.languages-form');
    addListener($languagesForm, 'submit', false);

    checkboxInit();
}

// EVENT HANDLERS
async function submitLanguagesForm(e){
    let $languagesForm = $('.languages-form');
    // let $defaultLangCheckbox = $('.default-language-wrapper')
    //     .find('input[type="checkbox"]');
    //     .removeAttr('disabled');

    let requestData = $languagesForm.serialize();
    // $defaultLangCheckbox.attr('disabled', 'disabled');
    
    // let $checkedLangCheckboxes = $('.other-languages-container')
    //     .find('input[type="checkbox"]')
    //     .filter(':checked');

    // let profileId = $('input[type="hidden"][name="profileId"]').val();
    // let requestData = { profileId: profileId };

    // let defaultCheckboxName = $defaultLangCheckbox.attr('name');
    // let otherCheckboxName = $checkedLangCheckboxes.attr('name');
    // let defaultLang = $defaultLangCheckbox.val();
    // let otherLangs = [];
    // $checkedLangCheckboxes.each((index, element) => {
    //     otherLangs.push($(element).val())
    // })

    // requestData[defaultCheckboxName] = defaultLang;
    // if (otherLangs.length > 0){
    //     requestData[otherCheckboxName] = otherLangs;
    // }
    
    try {
        let url = $languagesForm.attr('action');
        let HTMLStr = await $.post(url, requestData);

        PageManager.loadPageFromHTML(
            HTMLStr,
            '#toplevel-container',
            mainFragmentName,
            true,
            '/profiles/setup',
            '/profiles/setup',
        );
    } catch(jqXHR){
        let message = 'The requested action could not be completed.'
        PageManager.showError(message);
    }
}


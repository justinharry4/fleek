import { PageManager } from '../modules/page.js';
import { checkboxInit } from '../components/checkbox.js';

let source = '/scripts/content/add-profile.js';
let mainFragmentName = 'addProfile';

$(initializePage);

function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    console.log('FMETHOD', fetchMethod)

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
    console.log('add profile history')

    try {
        await PageManager.showHistory(page, '#lowlevel-container');
    } catch(error){
        throw error;
    }
}

// EVENT HANDLERS
function setEventHandlers(){
    let $button = $('.cancel-button');
    $button.off('click');
    $button.on('click', function(e) {
        $(this).css('color', 'red');
    })

    checkboxInit();
    
    console.log('addprofile handlers set');
}



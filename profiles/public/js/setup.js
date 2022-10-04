import { PageManager, addListener } from '/js/page.js';

let source = '/js/setup.js';
let mainFragmentName = 'setup';

$(initializePage);

function initializePage(){
    let $currentScript = $('script').filter(`[src="${source}"]`);
    let fetchMethod = $currentScript.data('fetchmethod');

    let page = new PageManager(mainFragmentName);
    
    if (fetchMethod === 'native'){
        PageManager.setWindowEventListeners();
        page.saveState('#toplevel-container', null, '/profiles/setup');

        setTimeout(() => $('#lowlevel-container').removeClass('offScreenRight'), 1);
    }

    setEventHandlers();

    PageManager.triggerInitWindowEvents(
        mainFragmentName,
        page,
        null,
        setEventHandlers,
    );
}

function setEventHandlers(){
    let $posterWrappers = $('.poster-wrapper');
    addListener($posterWrappers, 'click', togglePosterSelection);

    let $continueButton = $('.continue-button');
    // addListener($continueButton, 'click', submitPostersForm);
    
    // let $postersForm = $('.posters-form');
    // addListener($postersForm, 'submit', false);
}

function togglePosterSelection(e){
    let $posterImg = $(this).find('.poster');
    let $input = $(this).find('input[type="hidden"]');
    let $continueButton = $('.continue-button');

    if ($(this).hasClass('selected')){
        $(this).removeClass('selected');
        $posterImg.removeClass('selected');
        $input.attr('disabled', 'disabled');
    } else {
        $(this).addClass('selected');
        $posterImg.addClass('selected');
        $input.removeAttr('disabled');
    }

    let $selectedPosters = $('.poster-wrapper.selected');
    let readyText = 'Finished';
    let notReadyText = 'Pick 3 to continue'
    if ($selectedPosters.length >= 3){
        if (!$continueButton.hasClass('ready')){
            $continueButton.addClass('ready');
            $continueButton.removeAttr('disabled');
            $continueButton.val(readyText);
        }
    } else {
        if ($continueButton.hasClass('ready')){
            $continueButton.removeClass('ready');
            $continueButton.attr('disabled', 'disabled');
            $continueButton.val(notReadyText);
        }
    }
}

async function submitPostersForm(e){
    if ($(this).hasClass('ready')){
        let $postersForm = $('.posters-form');

        let url = $postersForm.attr('action');
        let requestData = $postersForm.serialize();

        try {
            let HTMLStr = await $.post(url, requestData);

            PageManager.loadPageFromHTML(
                HTMLStr,
                '#toplevel-container',
                mainFragmentName
            )
        } catch(jqXHR){
            let message = 'The requested action could not be completed.'
            PageManager.showError(message);
        }
    }
}

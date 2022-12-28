import { Page } from '/js/core/page-cb.js';
import { loadPageFromHTML, showError } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js';


class AddProfilePage extends Page {
    setPageProperties(){
        this.source = '/js/profiles/add-profile-cb.js';
        this.mainFragmentName = 'addProfile';
        this.trueURL = '/profiles/addprofile';
    }

    getEventMap(){
        let eventMap = [
            ['.profile-form input[type="text"]', 'input', 'highlightContinueButton'],
            ['.cancel-button', 'click', 'exitAddProfile'],
            ['.continue-button', 'click', 'submitProfileForm'],
            ['.kidCheckbox-label', 'mouseenter', 'showLabelHint'],
            ['.kidCheckbox-label', 'mouseleave', 'clearLabelHint']
        ]

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
    }

    // EVENT HANDLERS
    exitAddProfile(e){
        history.back();
    }
    
    highlightContinueButton(e){
        let $continuButton = $('.continue-button');
        let userInput = $(this).val();
    
        if (userInput.length > 0){
            $continuButton.addClass('ready');
        } else {
            $continuButton.removeClass('ready');
        }
    }
    
    async submitProfileForm(e){
        let $profileForm = $('.profile-form');
        let $textInput = $profileForm.find('input[type="text"]');
    
        if ($textInput.val().length > 0){
            let url = $profileForm.attr('action');
            let requestData = $profileForm.serialize();
    
            try {
                let HTMLStr = await $.post(url, requestData);
                
                loadPageFromHTML(
                    HTMLStr,
                    '#toplevel-container',
                    mainFragmentName,
                    true,
                    '/browse',
                    '/browse',
                );
            } catch(jqXHR){
                let message = 'The requested action could not be completed.'
                showError(message);
            }
        }
    }
    
    showLabelHint(e){
        let $labelHint = $('.kidLabelHint');
        $labelHint.addClass('visible');
    }
    
    clearLabelHint(e){
        let $labelHint = $('.kidLabelHint');
        $labelHint.removeClass('visible');
    }
}

$(() => { new AddProfilePage() });
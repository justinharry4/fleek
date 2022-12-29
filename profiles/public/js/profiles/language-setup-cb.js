import { FixedPage } from '/js/core/page-cb.js';
import { loadPageFromHTML } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js';


class LanguageSetupPage extends FixedPage {
    setPageProperties(){
        this.source = '/js/profiles/language-setup-cb.js';
        this.mainFragmentName = 'languageSetup';
        this.trueURL = '/profiles/languagesetup';
    }

    getEventMap(){
        let eventMap = [
            ['.next-button', 'click', 'submitLanguagesForm'],
            ['.languages-form', 'submit', false],
        ]

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
    }

    // EVENT HANDLERS
    async submitLanguagesForm(e){
        let page = e.data.page;

        let $languagesForm = $('.languages-form');
        let requestData = $languagesForm.serialize();
        
        try {
            let url = $languagesForm.attr('action');
            let HTMLStr = await $.post(url, requestData);
            
            loadPageFromHTML(
                HTMLStr,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/profiles/setup',
                '/profiles/setup',
            );
        } catch(jqXHR){
            let message = 'The requested action could not be completed.'
            showError(message);
        }
    }
}

$(() => { new LanguageSetupPage() });
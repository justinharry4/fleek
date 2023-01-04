import { FormPage } from '/js/auth/page.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js';

class CreditOptionPage extends FormPage {
    setPageProperties(){
        this.source = '/js/auth/signup-creditoption.js';
        this.mainFragmentName = 'creditoption';
        this.trueURL = '/signup/creditoption';
    }

    getEventMap(){
        let eventMap = [
            ['.signup-form', 'submit', 'submitCreditInfo'],
            ['.signup-tou-checkbox-label', 'customCheck:', 'clearWarningText'],
            ['#signup-change-plan-link', 'click', 'getChoosePlan'],
        ]

        return eventMap.concat(super.getEventMap());
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
    }

    // HELPER FUNCTIONS
    showTOUWarning(){
        let $parentForm = $('.signup-form');
        let $prevPara = $parentForm.find('p.warning-text');
        
        if ($prevPara.length === 0){
            let message = ('You must acknowledge that you have read and ' +
                            'agree to the Terms of Use to continue.');
            let $messagePara = $('<p>').text(message).addClass('warning-text');
            $parentForm.find('.submit-button').before($messagePara);
        }
    }

    // EVENT HANDLERS
    submitCreditInfo(e){
        if (!e.eventData || !e.eventData.termsAgreed){
            e.preventDefault();

            let $termsCheckbox = $(this).find('#signup-form-tou-checkbox');
            if ($termsCheckbox.get(0).checked){
                let submitEvent = $.Event('submit');
                submitEvent.eventData = { termsAgreed: true };
                return $(this).trigger(submitEvent);
            }

            let page = e.data.page;
            page.showTOUWarning();
        }
    }

    clearWarningText(e){
        let $parentForm = $(this).parent()
        let $prevPara = $parentForm.find('p.warning-text');

        if (e.checkState === 'checked'){
            if ($prevPara.length !== 0){
                $prevPara.remove();
            }
        }
        if (e.checkState === 'unchecked'){
            let page = e.data.page;
            page.showTOUWarning();
        }
    }

    async getChoosePlan(e){
        try {
            let page = e.data.page;
            let { resData } = await ajax.get('/signup/chooseplan');

            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/chooseplan',
                '/signup/chooseplan',
            );
        } catch (jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
}

$(() => { new CreditOptionPage() });

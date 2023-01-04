import { FormPage } from '/js/auth/page.js';
import { ajax, loadPageFromHTML, showError } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js';

class RegformPage extends FormPage {
    setPageProperties(){
        this.source = '/js/auth/signup-regform.js';
        this.mainFragmentName = 'regform';
        this.trueURL = '/signup/regform';
    }

    getEventMap(){
        let eventMap = [
            ['#signup-form-proceed', 'click', 'submitUserRegForm'],
            ['#account-created-proceed', 'click', 'getRegStep2'],
        ]

        return eventMap.concat(super.getEventMap());
    }

    setEventHandlers(){
        super.setEventHandlers();

        this.adjustInputLabels();
        checkboxInit();
    }

    adjustInputLabels(){
        let $formInputs = $('input:not([type="submit"], [type="button"])');
        $formInputs.each((index, element) => {
            let userInput = $(element).val();
            let inputId = $(element).attr('id');
            let $parentElement = $(element).closest('li');
            let $inputLabel = $parentElement.find(`label[for="${inputId}"]`);
            if (userInput.length > 0){
                $inputLabel.addClass('focus-label');
            } else {
                $inputLabel.removeClass('focus-label');
            }
        })
    }

    // EVENT HANDLERS
    async submitUserRegForm(e){
        let page = e.data.page;

        let $userRegForm = $('.signup-form');
        let requestData = $userRegForm.serialize();
        
        try {
            let { resData } = await ajax.post('/signup/regform', requestData);
            
            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/regstep2',
                '/signup/regstep2',
            );
        } catch({ jqXHR }) {
            if (jqXHR.status === 422){
                let body = JSON.parse(jqXHR.responseText);
                let inputFields = ['email', 'password'];
                
                inputFields.forEach(inputField => {
                    let $formInput = $(`.signup-form input[name="${inputField}"]`);

                    if (body.fields.includes(inputField)){
                        $formInput.addClass('invalid-input');
                    } else {
                        $formInput.removeClass('invalid-input');
                    }
                });

                let $messageDiv = $('<div><span></span></div>');
                let messageDivClasses = 'validation-error flex-wrapper text-bold';
                $messageDiv.addClass(messageDivClasses);
                $messageDiv.find('span').text(body.message);

                let $parentDiv = $('.signup-main-wrapper');
                let $prevDiv = $parentDiv.find('.validation-error');
                if ($prevDiv.length !== 0){
                    $prevDiv.remove();
                }

                $parentDiv.prepend($messageDiv);
            } else {
                console.log(jqXHR);
                let message = 'The requested action could not be completed.'
                showError(message);
            }
        }
    }

    async getRegStep2(e){
        try {
            let page = e.data.page;

            let { resData } = await ajax.get('/signup/regstep2');
            
            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/regstep2',
                '/signup/regstep2',
            );
        } catch (jqXHR){
            console.log('FAIL', jqXHR);
        }
    }

    clearRequiredInputMessage(e){
        let userInput = $(this).val();
        let $parentElement = $(this).closest('li');
        let $prevMessage = $parentElement.find('.required-field');
        if (userInput.length > 0 && $prevMessage.length > 0){
            $prevMessage.remove();
        }
    }

    toggleRequiredInputMessage(e){
        let userInput = $(this).val();
        let inputId = $(this).attr('id');
        let $parentElement = $(this).closest('li');
        let $prevMessage = $parentElement.find('.required-field');
        let $inputWrapper = $(this).closest('[class$="input-wrapper"], [id$="input-wrapper"]');
        $inputWrapper.removeClass('focus-input-wrapper')
        if (userInput.length === 0){
            $(this).addClass('invalid-input');
            if ($inputWrapper.length !== 0){
                $inputWrapper.addClass('invalid-input')
            }
            if ($prevMessage.length === 0){
                let $inputTitle = $parentElement.find(`label[for="${inputId}"]`).text();
                let message = $inputTitle + ' is required';
                let $messageDiv = $('<div>')
                    .addClass('warning-text signup-sub-main-text required-field')
                    .text(message);
                $parentElement.append($messageDiv)
            }
        } else {
            $(this).removeClass('invalid-input');
            if ($inputWrapper.length !== 0){
                $inputWrapper.removeClass('invalid-input')
            }
            if ($prevMessage.length !== 0){
                $prevMessage.remove()
            }
        }
    }

    animateInputLabel(e){
        console.log('inside animate');
        let inputId = $(this).attr('id');
        let $parentElement = $(this).closest('li');
        let $inputLabel = $parentElement.find(`label[for="${inputId}"]`);
        if (e.type === 'focus'){
            $inputLabel.addClass('focus-label');
        }
        if (e.type === 'blur'){
            let userInput = $(this).val();
            if (userInput.length === 0){
                $inputLabel.removeClass('focus-label');
            }
        }
    }

    triggerWrapperFocus(e){
        let $inputWrapper = $(this).closest('[class$="input-wrapper"], [id$="input-wrapper"]');
        if ($inputWrapper.length > 0){
            let customFocus = $.Event('customFocus:')
            $inputWrapper.trigger(customFocus);
        }
    }
    
    addWrapperFocusStyles(e){
        $(this).addClass('focus-input-wrapper');
    }
}

$(() => { new RegformPage() });
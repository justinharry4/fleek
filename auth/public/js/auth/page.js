import { FixedPage } from '/js/core/page-cb.js';

class FormPage extends FixedPage {
    getEventMap(){
        let eventMap = [
            ['input:not([type="submit"], [type="button"])', 'input', 'clearRequiredInputMessage'],
            ['input:not([type="submit"], [type="button"])', 'blur', 'toggleRequiredInputMessage'],
            ['input:not([type="submit"], [type="button"])', 'blur', 'animateInputLabel'],
            ['input:not([type="submit"], [type="button"])', 'focus', 'animateInputLabel'],
            ['input:not([type="submit"], [type="button"])', 'focus', 'triggerWrapperFocus'],
            ['[class$="input-wrapper"], [id$="input-wrapper"]', 'customFocus:', 'addWrapperFocusStyles'],
        ];

        return eventMap;
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


export { FormPage };
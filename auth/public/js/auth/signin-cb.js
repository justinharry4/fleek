import { Page } from '/js/core/page-cb.js';
import { checkboxInit } from '/js/core/checkbox.js';

class SignInPage extends Page {
    setPageProperties(){
        this.source = '/js/auth/signin-cb.js';
        this.mainFragmentName = 'signin';
        this.trueURL = '/signin';
    }

    getEventMap(){
        let eventMap = [
            ['#form-signin li input', 'focus', 'animateInputLabel'],
            ['#form-signin li input', 'blur', 'animateInputLabel']
        ]

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
    }

    // EVENT HANDLERS
    animateInputLabel(e){
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
}

$(() => { new SignInPage() });




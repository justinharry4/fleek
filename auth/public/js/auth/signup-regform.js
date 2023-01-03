import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML, showError } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js'

class RegformPage extends FixedPage {
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

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
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
}

$(() => { new RegformPage() });
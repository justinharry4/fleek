import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';

class SignupStep3Page extends FixedPage {
    setPageProperties(){
        this.source = '/js/auth/signup-step3.js';
        this.mainFragmentName = 'regstep3';
        this.trueURL = '/signup/regstep3';
    }

    getEventMap(){
        let eventMap = [
            ['.proceed-button', 'click', 'getCreditOption'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    async getCreditOption(e){
        try {
            let page = e.data.page;

            let { resData } = await ajax.get('/signup/creditoption');

            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/creditoption',
                '/signup/creditoption',
            );
        } catch (jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
}

$(() => { new SignupStep3Page() });
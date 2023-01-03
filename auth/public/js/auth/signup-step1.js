import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';

class SignupStep1Page extends FixedPage {
    setPageProperties(){
        this.source = '/js/auth/signup-step1.js';
        this.mainFragmentName = 'regstep1';
        this.trueURL = '/signup/regstep1';
    }

    getEventMap(){
        let eventMap = [
            ['.proceed-button', 'click', 'getRegform'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    async getRegform(e){
        try {
            let page = e.data.page;
            let { resData } = await ajax.get('/signup/regform');

            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/regform',
                '/signup/regform',
                false,
            );
        } catch (jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
}

$(() => { new SignupStep1Page() });
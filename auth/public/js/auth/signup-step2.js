import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';

class SignupStep2Page extends FixedPage {
    setPageProperties(){
        this.source = '/js/auth/signup-step2.js';
        this.mainFragmentName = 'regstep2';
        this.trueURL = '/signup/regstep2';
    }

    getEventMap(){
        let eventMap = [
            ['.proceed-button', 'click', 'getChoosePlan'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
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

$(() => { new SignupStep2Page() });
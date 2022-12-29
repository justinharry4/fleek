import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';


class DeleteProfilePage extends FixedPage {
    setPageProperties(){
        this.source = '/js/profiles/delete-profile-cb.js';
        this.mainFragmentName = 'deleteProfile';
        this.trueURL = '/deleteprofile';
    }

    getEventMap(){
        let eventMap = [
            ['.actions-wrapper .cancel-button', 'click', 'exitDeleteProfile'],
            ['.deleteProfile-form', 'submit', 'submitDeleteProfileForm'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    async exitDeleteProfile(e){
        let page = e.data.page;

        let url = '/profiles/editprofile';
        let requestData = $(this).closest('form').serialize();
    
        try {
            let { resData } = await ajax.get(url, requestData);
    
            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                false,
            );
        } catch({ jqXHR }){
            console.log('FAIL', jqXHR);
        }
    }
    
    async submitDeleteProfileForm(e){
        e.preventDefault();
        let page = e.data.page;
    
        let url = $(this).attr('action');
        let requestData = $(this).serialize()
    
        try {
            let { jqXHR, resData } = await ajax.post(url, requestData);
    
            let resourceLocation = jqXHR.getResponseHeader('Resource-Location');
    
            loadPageFromHTML(
                resData, 
                '#toplevel-container',
                page.mainFragmentName,
                true,
                resourceLocation,
                resourceLocation,
            );
        } catch({ jqXHR }){
            console.log('FAIL', jqXHR);
        }
    }
}

$(() => { new DeleteProfilePage() });
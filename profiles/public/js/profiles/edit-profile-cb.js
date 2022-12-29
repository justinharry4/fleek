import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';
import { checkboxInit } from '/js/core/checkbox.js';


class EditProfilePage extends FixedPage {
    setPageProperties(){
        this.source = '/js/profiles/edit-profile-cb.js';
        this.mainFragmentName = 'editProfile';
        this.trueURL = '/editprofile';
    }

    getEventMap(){
        let eventMap = [
            ['.editProfile-form', 'submit', 'submitEditProfileForm'],
            ['.actions-wrapper .cancel-button', 'click', 'exitEditProfile'],
            ['.actions-wrapper .delete-button', 'click', 'getDeleteProfile'],
        ];

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        checkboxInit();
    }

    // EVENT HANDLERS
    exitEditProfile(e){
        history.back();
    }
    
    async submitEditProfileForm(e){
        e.preventDefault();
        let page = e.data.page;
    
        let $textInput = $(this).find('input[name="profileName"]');
    
        if ($textInput.val().length > 0){
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
     
    async getDeleteProfile(e){
        let page = e.data.page;

        let $profileIdInput = $('.editProfile-form input[name="profileId"]');
        let profileId = $profileIdInput.val();
    
        let url = '/profiles/deleteprofile';
        let requestData = { profileId: profileId }
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
}

$(() => { new EditProfilePage() });

import { ProfilesPage } from '/js/profiles/profiles-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';


class ManageProfilesPage extends ProfilesPage {
    setPageProperties(){
        this.source = '/js/profiles/manage-profiles-cb.js';
        this.mainFragmentName = 'manageProfiles';
        this.trueURL = '/manageprofiles';
    }

    getEventMap(){
        let eventMap = [
            ['.profile-wrapper', 'mouseenter', 'highlightProfile'],
            ['.profile-wrapper', 'mouseleave', 'unhighlightProfile'],
            ['.add-profile-wrapper', 'click', 'getAddProfile'],
            ['.profile-wrapper[data-profile-id]', 'click', 'getEditProfile'],
            ['.done-button', 'click', 'exitManageProfiles'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    async getEditProfile(e){
        let page = e.data.page;
        let profileId = $(this).data('profile-id');
        let requestData = { profileId: profileId }
    
        try {
            let url = '/profiles/editprofile'
            let { resData } = await ajax.get(url, requestData);
            
            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                false,
            );
        } catch(jqXHR){
            console.log('FAIL', jqXHR)
        }
    }

    exitManageProfiles(e){
        history.back()
    }
}

$(() => { new ManageProfilesPage() });
import { FixedPage } from '/js/core/page-cb.js';
import { loadPageFromHTML, ajax } from '/js/core/utils.js';


class ProfilesPage extends FixedPage {
    setPageProperties(){
        this.source = '/js/profiles/profiles-cb.js';
        this.mainFragmentName = 'profiles';
        this.trueURL = '/profiles';
    }

    getEventMap(){
        let eventMap = [
            ['.profile-wrapper', 'mouseenter', 'highlightProfile'],
            ['.profile-wrapper', 'mouseleave', 'unhighlightProfile'],
            ['.add-profile-wrapper', 'click', 'getAddProfile'],
            ['.profile-wrapper[data-profile-id]', 'click', 'getBrowse']
        ]

        return eventMap;
    }

    setEventHandlers(){
        super.setEventHandlers();

        this.adjustAddProfileHoverState();
    }

    // UTILITY FUNCTIONS
    adjustAddProfileHoverState(){
        let $profileWrappers = $('.profile-wrapper');
    
        $profileWrappers.each((index, element) => {
            let $profileWrapperHover = $(element).filter(':hover');
            let $profileElement = $($(element).find('> *').get(0));
            let isHighlighted = $profileElement.hasClass('highlight');
            if ($profileWrapperHover.length === 0 && isHighlighted){
                $(element).trigger('mouseleave');
            }
        })
    }

    // EVENT HANDLERS
    highlightProfile(e){
        let $profileElements = $(this).find('> *, svg path');
        let $profileImg = $(this).find('img');
    
        $profileElements.addClass('highlight');
        $profileImg.css({ borderRadius: '0px' })
    }
    
    unhighlightProfile(e){
        let $profileElements = $(this).find('> *, svg path');
        let $profileImg = $(this).find('img');
    
        $profileElements.removeClass('highlight');
        $profileImg.css({ borderRadius: '4px' })
    }
    
    async getAddProfile(e){
        try {
            let page = e.data.page;
            let { resData } = await ajax.get('/profiles/addprofile');

            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/profiles/addprofile',
                '/profiles/addprofile',
            );
        } catch (jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
    
    async getBrowse(e){
        try {
            let page = e.data.page;
            let profileId = $(this).data('profile-id');
            let { jqXHR, resData } = await ajax.get('/browse', {profileId: profileId});
            
            let resourceLocation = jqXHR.getResponseHeader('Resource-Location');

            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                resourceLocation,
                resourceLocation,
            );
        } catch(jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
}


$(() => { new ProfilesPage() });

export { ProfilesPage };
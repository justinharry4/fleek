import { FixedPage } from '/js/core/page-cb.js';
import { loadPageFromHTML } from '/js/core/utils.js';


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
            let HTMLStr = await $.get('/profiles/addprofile');

            loadPageFromHTML(
                HTMLStr,
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
            let HTMLStr = await $.get('/browse', {profileId: profileId});
            
            loadPageFromHTML(
                HTMLStr,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/profiles/languagesetup',
                '/profiles/languagesetup',
            );
        } catch(jqXHR){
            console.log('FAIL', jqXHR);
        }
    }
}


$(() => { new ProfilesPage() });

export { ProfilesPage };
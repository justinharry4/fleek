import { FixedPage } from '/js/core/page-cb.js';

class SetupPage extends FixedPage {
    setPageProperties(){
        this.source = '/js/profiles/setup.js';
        this.mainFragmentName = 'setup';
        this.trueURL = '/profiles/setup';
    }

    getEventMap(){
        let eventMap = [
            ['.poster-wrapper', 'click', 'togglePosterSelection'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    togglePosterSelection(e){
        let $posterImg = $(this).find('.poster');
        let $input = $(this).find('input[type="hidden"]');
        let $continueButton = $('.continue-button');
    
        if ($(this).hasClass('selected')){
            $(this).removeClass('selected');
            $posterImg.removeClass('selected');
            $input.attr('disabled', 'disabled');
        } else {
            $(this).addClass('selected');
            $posterImg.addClass('selected');
            $input.removeAttr('disabled');
        }
    
        let $selectedPosters = $('.poster-wrapper.selected');
        let readyText = 'Finished';
        let notReadyText = 'Pick 3 to continue'
        if ($selectedPosters.length >= 3){
            if (!$continueButton.hasClass('ready')){
                $continueButton.addClass('ready');
                $continueButton.removeAttr('disabled');
                $continueButton.val(readyText);
            }
        } else {
            if ($continueButton.hasClass('ready')){
                $continueButton.removeClass('ready');
                $continueButton.attr('disabled', 'disabled');
                $continueButton.val(notReadyText);
            }
        }
    }
}

$(() => { new SetupPage() });
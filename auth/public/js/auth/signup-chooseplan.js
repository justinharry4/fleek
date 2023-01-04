import { FixedPage } from '/js/core/page-cb.js';
import { ajax, loadPageFromHTML } from '/js/core/utils.js';

class ChoosePlanPage extends FixedPage {
    setPageProperties(){
        this.source = '/js/auth/signup-chooseplan.js';
        this.mainFragmentName = 'chooseplan';
        this.trueURL = '/signup/chooseplan';
    }

    getEventMap(){
        let eventMap = [
            ['.proceed-button', 'click', 'submitSubPlanInfo'],
            ['th[data-sub-plan], td[data-sub-plan]', 'click', 'selectSubPlan'],
        ]

        return eventMap;
    }

    // EVENT HANDLERS
    async submitSubPlanInfo(e){
        let page = e.data.page;

        let subPlan = $('input[type="radio"]:checked').val();
        let requestData = { subPlan: subPlan };
        
        try {
            let { resData } = await ajax.post('/signup/chooseplan', requestData);
            
            loadPageFromHTML(
                resData,
                '#toplevel-container',
                page.mainFragmentName,
                true,
                '/signup/regstep3',
                '/signup/regstep3',
            );
        } catch({ jqXHR }) {
            console.log('FAIL', jqXHR);
        }
    }

    selectSubPlan(e){
        let selectedSubPlan = $(this).data('sub-plan');
        let selectedClass = 'sub-plan-' + selectedSubPlan;
        let $selectedButton = $(`.sub-plan-button.${selectedClass}`);
        let $selectedTds = $(`td.${selectedClass}`);
        let $inactiveButtons = $(`.sub-plan-button:not(.${selectedClass})`);
        let $inactiveTds = $(`td:not(.${selectedClass})`);
    
        $selectedButton.addClass('signup-native-bg');
        $selectedButton.removeClass('signup-inactive-native-bg');
        $selectedTds.addClass('signup-native-fg');
        $inactiveTds.removeClass('signup-native-fg');
        $inactiveButtons.addClass('signup-inactive-native-bg');
        $inactiveButtons.removeClass('signup-native-bg');
        
    
        let $radioButton = $selectedButton.find('input[type="radio"]');
        let $checkedButtons = $('input[type="radio"]:checked');
        $checkedButtons.get().forEach(btn => {
            btn.checked = false;
        });
        $radioButton.get(0).checked = true;
    }
}

$(() => { new ChoosePlanPage() });
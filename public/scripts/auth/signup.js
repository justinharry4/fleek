$(setInitialEventHandlers);

function setInitialEventHandlers(){
    setEventHandlers();
}

function setEventHandlers(){
    let $proceedButtons = $('.signup-main-wrapper button');
    $proceedButtons.on('click', getNextSignupPage);
    let $subPlanButtons = $('.sub-plan-button');
    $subPlanButtons.on('click', selectSubPlan);
    
    let arr = Array.from($('#signup-sub-plan-radio'));
    console.log(arr, typeof arr);
}

function getNextSignupPage(e){
    let url = '/auth/signup';
    let method = 'GET';
    let accountInfo = $(this).data('account-info');
    let nextStepName = $(this).data('next-signup-stepname');
    let requestData = { 'step': nextStepName, accountInfo: accountInfo };
    if (accountInfo === 'credentials'){
        method = 'POST';
        let email = $('#signup-form-email').val();
        let password = $('#signup-form-password').val();
        requestData = {...requestData, accountInfo: 'credentials', email: email, password: password };
    } else if (accountInfo === 'subscription-plan'){
        method = 'POST';

    } else if (accountInfo === 'credit-info'){
        
    }
    $.ajax({
        url: url,
        method: method,
        data: requestData,
        dataType: 'html',
    })
        .done(htmlData => {
            let $currentBody = $('body');
            let $nextPage = $(htmlData);
            let $nextPageDivContainer = $nextPage.filter('#signup-toplevel-container');
            $nextPageDivContainer.css({
                right: '100%',
                position: 'relative'
            });
            $currentBody.html($nextPageDivContainer);
            $nextPageDivContainer.animate({right: '0%'}, 200);
        
            let stateObject = { signupStepName: nextStepName };
            let newUrl = '/auth/signup?step=' + nextStepName;
            history.pushState(stateObject, '', newUrl);
            setEventHandlers();
        })
}

function selectSubPlan(e){
    let subPlanList = ['mobile', 'basic', 'standard', 'premium']
    let selectedSubPlan = $(this).data('sub-plan');
    let selectedClass = 'sub-plan-' + selectedSubPlan;
    let $selectedTds = $(`td.${selectedClass}`);
    let $inactiveButtons = $(`.sub-plan-button:not(.${selectedClass})`);
    let $inactiveTds = $(`td:not(.${selectedClass})`);

    $(this).addClass('signup-native-bg');
    $(this).removeClass('signup-inactive-native-bg');
    $selectedTds.addClass('signup-native-fg');
    $inactiveTds.removeClass('signup-native-fg');
    $inactiveButtons.addClass('signup-inactive-native-bg');
    $inactiveButtons.removeClass('signup-native-bg');
    
    let $radioButton = $(this).find('input[type="radio"]');
    let $checkedButtons = $('input[type="radio"]:checked');
    $checkedButtons.get().forEach(btn => {
        btn.checked = false;
    });
    $radioButton.get(0).checked = true;
}
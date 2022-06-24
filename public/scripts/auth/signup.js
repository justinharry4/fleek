$(initializePage);

function initializePage(){
    $(window).on('popstate', showPageInHistory)
    window.signupStates = {};

    let stepName = $('.proceed-button').data('signup-stepname');
    let $currentPageDivContainer = $('#signup-toplevel-container');
    window.signupStates[stepName] = $currentPageDivContainer;
    let stateObject = { ref: stepName };
    history.replaceState(stateObject, '');
    setEventHandlers();
}

function setEventHandlers(){
    let $proceedButton = $('.proceed-button');
    $proceedButton.on('click', getNextSignupPage);

    let $subPlanButtons = $('.sub-plan-button');
    $subPlanButtons.on('click', selectSubPlan);
}

function setHistoryState(){
    let stepName = $('.proceed-button').data('signup-stepname');
    let $currentPageDivContainer = $('#signup-toplevel-container');
    window.signupStates[stepName] = $currentPageDivContainer;
    let stateObject = { ref: stepName };
    let newUrl = '/auth/signup?step=' + stepName;
    history.pushState(stateObject, '', newUrl);

    // setTimeout(() => {
    //     $currentPageDivContainer.removeClass('off-screen-left on-screen-to-right');
    // }, 100)
}

function getNextSignupPage(e){
    let url = '/auth/signup';
    let method = 'GET';
    let accountInfo = $(this).data('account-info');
    let nextStepName = $(this).data('next-signup-stepname');
    let requestData = { step: nextStepName, accountInfo: accountInfo };
    if (accountInfo === 'credentials'){
        method = 'POST';
        let email = $('#signup-form-email').val();
        let password = $('#signup-form-password').val();
        requestData = { ...requestData, email: email, password: password };
    } else if (accountInfo === 'subscription-plan'){
        method = 'POST';
        let subPlan = $('input[type="radio"]:checked').val();
        requestData = { ...requestData, subPlan: subPlan }
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
            let $currentPageDivContainer = $('#signup-toplevel-container');
            let $nextPage = $(htmlData);
            let $nextPageDivContainer = $nextPage.filter('#signup-toplevel-container');
            $nextPageDivContainer.addClass('off-screen-left');
            $currentBody.html($nextPageDivContainer);
            setTimeout(() => {
                $nextPageDivContainer.addClass('on-screen-to-right');
            }, 1);
            $currentPageDivContainer.addClass('off-screen-left');
            $currentPageDivContainer.removeClass('on-screen-to-right');
            setHistoryState();
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

function showPageInHistory(e){
    let stepName = history.state.ref;
    let $newDivContainer = window.signupStates[stepName];
    console.log($newDivContainer);
    let $currentBody = $('body');
    let $oldDivContainer = $('#signup-toplevel-container');
    $currentBody.html($newDivContainer);
    setTimeout(() => {
        $newDivContainer.addClass('on-screen-to-right');
    }, 1);
    $oldDivContainer.addClass('off-screen-left');
    $oldDivContainer.removeClass('on-screen-to-right')
    setEventHandlers();
}
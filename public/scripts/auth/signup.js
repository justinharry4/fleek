$(initializePage);
console.log('running script');
function initializePage(){
    $(window).on('popstate', showPageInHistory)
    window.signupStates = {};

    let stepName = $('.proceed-button, .submit-button').data('signup-stepname');
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

    let $creditInfoForm = $('.signup-step-credit-option .signup-form');
    $creditInfoForm.on('submit', submitCreditInfo);

    let $termsCheckboxLabel = $('.signup-step-credit-option .signup-tou-checkbox-label');
    $termsCheckboxLabel.on('customCheck:', clearWarningText)
}

function setHistoryState(){
    let stepName = $('.proceed-button, .submit-button').data('signup-stepname');
    let $currentPageDivContainer = $('#signup-toplevel-container');
    window.signupStates[stepName] = $currentPageDivContainer;
    let stateObject = { ref: stepName };
    let newUrl = '/signup/' + stepName;
    history.pushState(stateObject, '', newUrl);
}

function getNextSignupPage(e){
    let stepName = $(this).data('signup-stepname');
    let nextStepName = $(this).data('next-signup-stepname');

    let url = '/signup/' + nextStepName;
    let method = 'GET';
    let requestData = {};
    console.log(stepName, nextStepName);

    if (stepName === 'regform'){
        method = 'POST';
        let email = $('#signup-form-email').val();
        let password = $('#signup-form-password').val();
        requestData.email = email;
        requestData.password = password;
    } else if (stepName === 'chooseplan'){
        method = 'POST';
        let subPlan = $('input[type="radio"]:checked').val();
        requestData.subPlan = subPlan;
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
        .fail( jqXHR => {
            if (jqXHR.status === 422){
                let body = JSON.parse(jqXHR.responseText);
                let inputFields = ['email', 'password']
                inputFields.forEach(inputField => {
                    let $formInput = $(`.signup-form input[name="${inputField}"]`)
                    if (body.fields.includes(inputField)){
                        $formInput.addClass('invalid-input');
                    } else {
                        $formInput.removeClass('invalid-input');
                    }
                })
                let $messageDiv = $('<div><span></span></div>')
                    .addClass('validation-error flex-wrapper text-bold');
                $messageDiv.find('span').text(body.message);
                let $parentDiv = $('.signup-main-wrapper');
                let $prevDiv = $parentDiv.find('.validation-error');
                if ($prevDiv.length !== 0){
                    $prevDiv.remove();
                }
                $parentDiv.prepend($messageDiv);
            }
        })
}

function selectSubPlan(e){
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
    let $currentBody = $('body');
    let $oldDivContainer = $('#signup-toplevel-container');
    if (!$newDivContainer){
        $.get({
            url: '/signup/' + stepName,
            // method: 'GET',
            dataType: 'html'
        })
            .done(htmlData => {
                let $newPage = $(htmlData);
                $newDivContainer = $newPage.filter('#signup-toplevel-container');
                $newDivContainer.addClass('off-screen-left');
                $currentBody.html($newDivContainer);
                setTimeout(() => {
                    $newDivContainer.addClass('on-screen-to-right');
                }, 1);
                $oldDivContainer.addClass('off-screen-left');
                $oldDivContainer.removeClass('on-screen-to-right');
                setEventHandlers();
            })
    } else {
        $currentBody.html($newDivContainer);
        setTimeout(() => {
            $newDivContainer.addClass('on-screen-to-right');
        }, 1);
        $oldDivContainer.addClass('off-screen-left');
        $oldDivContainer.removeClass('on-screen-to-right')
        setEventHandlers();
    }
    console.log('expected last');
}

function submitCreditInfo(e){
    if (!e.eventData || !e.eventData.termsAgreed){
        e.preventDefault();
        let $termsCheckbox = $(this).find('#signup-form-tou-checkbox');
        console.log($termsCheckbox.get(0).checked);
        if ($termsCheckbox.get(0).checked){
            let submitEvent = $.Event('submit');
            submitEvent.eventData = { termsAgreed: true };
            return $(this).trigger(submitEvent);
        }
        let $parentForm = $(this);
        let $prevPara = $parentForm.find('p.warning-text');
        if ($prevPara.length === 0){
            let message = 'You must acknowledge that you have read and agree to the Terms of Use to continue.';
            let $messagePara = $('<p>').text(message).addClass('warning-text');
            $parentForm.find('.submit-button').before($messagePara);
        }
    }
}

function clearWarningText(e){
    let $parentForm = $(this).parent()
    let $prevPara = $parentForm.find('p.warning-text');
    if (e.checkState === 'checked'){
        if ($prevPara.length !== 0){
            $prevPara.remove();
        }
    }
    if (e.checkState === 'unchecked'){
        if ($prevPara.length === 0){
            let message = 'You must acknowledge that you have read and agree to the Terms of Use to continue.';
            let $messagePara = $('<p>').text(message).addClass('warning-text');
            $(this).after($messagePara);
        }
    }
}
$(initializePage);

function initializePage(){
    $(window).on('popstate', showPageInHistory)
    window.signupStates = {};

    let stepName = $('.proceed-button, .submit-button').data('signup-stepname');
    if (stepName !== 'regform'){
        let $currentPageDivContainer = $('#signup-toplevel-container');
        window.signupStates[stepName] = $currentPageDivContainer;
    }
    let stateObject = { ref: stepName };
    history.replaceState(stateObject, '');
    setEventHandlers();
    adjustInputLabels();
}

function setEventHandlers(){
    let $proceedButton = $('.proceed-button');
    $proceedButton.on('click', getNextSignupPage);

    let $subPlanButtons = $('th[data-sub-plan], td[data-sub-plan]');
    $subPlanButtons.on('click', selectSubPlan);

    let $creditInfoForm = $('.signup-step-creditoption .signup-form');
    $creditInfoForm.on('submit', submitCreditInfo);

    let $termsCheckboxLabel = $('.signup-step-creditoption .signup-tou-checkbox-label');
    $termsCheckboxLabel.on('customCheck:', clearWarningText);

    let $changePlanLink = $('#signup-change-plan-link');
    $changePlanLink.on('click', getChoosePlanPage);

    let $formInputs = $('input:not([type="submit"], [type="button"])');
    $formInputs.on('input', clearRequiredInputMessage);
    $formInputs.on('blur', toggleRequiredInputMessage)
        .on('blur', animateInputLabel);
    $formInputs.on('focus', triggerWrapperFocus)
        .on('focus', animateInputLabel);

    let $inputWrappers = $('[class$="input-wrapper"], [id$="input-wrapper"]');
    $inputWrappers.on('customFocus:', addWrapperFocusStyles);
}

function setHistoryState(){
    let stepName = $('.proceed-button, .submit-button').data('signup-stepname');
    if (stepName !== 'regform'){
        let $currentPageDivContainer = $('#signup-toplevel-container');
        window.signupStates[stepName] = $currentPageDivContainer;
    }
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

    if (stepName === 'regform' && nextStepName === 'regform'){
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
            putNewSlide(htmlData);
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

function showPageInHistory(e){
    let stepName = history.state.ref;

    let $newDivContainer = window.signupStates[stepName];
    if (!$newDivContainer){
        let url = '/signup/' + stepName;
        $.get(url)
            .done(htmlData => {
                putNewSlide(htmlData);
                setEventHandlers();
            })
    } else {
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
}

function submitCreditInfo(e){
    if (!e.eventData || !e.eventData.termsAgreed){
        e.preventDefault();
        let $termsCheckbox = $(this).find('#signup-form-tou-checkbox');
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

function getChoosePlanPage(e){
    $.get('/signup/chooseplan')
        .done(htmlData => {
            putNewSlide(htmlData);
            setHistoryState();
            setEventHandlers();
        })
}

function putNewSlide(htmlData){
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
}

function toggleRequiredInputMessage(e){
    let userInput = $(this).val();
    let inputId = $(this).attr('id');
    let $parentElement = $(this).closest('li');
    let $prevMessage = $parentElement.find('.required-field');
    let $inputWrapper = $(this).closest('[class$="input-wrapper"], [id$="input-wrapper"]');
    $inputWrapper.removeClass('focus-input-wrapper')
    if (userInput.length === 0){
        $(this).addClass('invalid-input');
        if ($inputWrapper.length !== 0){
            $inputWrapper.addClass('invalid-input')
        }
        if ($prevMessage.length === 0){
            let $inputTitle = $parentElement.find(`label[for="${inputId}"]`).text();
            let message = $inputTitle + ' is required';
            let $messageDiv = $('<div>')
                .addClass('warning-text signup-sub-main-text required-field')
                .text(message);
            $parentElement.append($messageDiv)
        }
    } else {
        $(this).removeClass('invalid-input');
        if ($inputWrapper.length !== 0){
            $inputWrapper.removeClass('invalid-input')
        }
        if ($prevMessage.length !== 0){
            $prevMessage.remove()
        }
    }
}

function clearRequiredInputMessage(e){
    let userInput = $(this).val();
    let $parentElement = $(this).closest('li');
    let $prevMessage = $parentElement.find('.required-field');
    if (userInput.length > 0 && $prevMessage.length > 0){
        $prevMessage.remove();
    }
}

function triggerWrapperFocus(e){
    let $inputWrapper = $(this).closest('[class$="input-wrapper"], [id$="input-wrapper"]');
    if ($inputWrapper.length > 0){
        let customFocus = $.Event('customFocus:')
        $inputWrapper.trigger(customFocus);
    }
}

function addWrapperFocusStyles(e){
    $(this).addClass('focus-input-wrapper');
}

function animateInputLabel(e){
    let inputId = $(this).attr('id');
    let $parentElement = $(this).closest('li');
    let $inputLabel = $parentElement.find(`label[for="${inputId}"]`);
    if (e.type === 'focus'){
        $inputLabel.addClass('focus-label');
    }
    if (e.type === 'blur'){
        let userInput = $(this).val();
        if (userInput.length === 0){
            $inputLabel.removeClass('focus-label');
        }
    }
}

function adjustInputLabels(){
    let $formInputs = $('input:not([type="submit"], [type="button"])');
    $formInputs.each((index, element) => {
        let userInput = $(element).val();
        let inputId = $(element).attr('id');
        let $parentElement = $(element).closest('li');
        let $inputLabel = $parentElement.find(`label[for="${inputId}"]`);
        if (userInput.length > 0){
            $inputLabel.addClass('focus-label');
        } else {
            $inputLabel.removeClass('focus-label');
        }
    })
}
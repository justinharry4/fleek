$(initializePage)

function initializePage(){
    adjustInputLabels();
    setEventHandlers();
}
function setEventHandlers(){
    let $faqButtons = $('#home-faq-wrapper ul li div.home-faq-button');
    $faqButtons.on('click', showFaqAnswer)

    let $signupForm = $('.form-signup');
    $signupForm.on('submit', validateEmailForm);

    let $emailInput = $('.form-signup input[type="email"]');
    $emailInput.on('input', validateEmailInput);
    
    let $inputs = $('.form-signup-ul li input');
    $inputs.on('focus', animateInputLabel);
    $inputs.on('blur', animateInputLabel);

    let $signoutButton = $('.signout-button');
    $signoutButton.on('click', signout)
}

// EVENT HANDLERS 
function showFaqAnswer(e){
    let slideSpeed = 80;
    let slideEase = 'linear';
    $currentAnswerDiv = $(this).next();
    $answerDivs = $('#home-faq-wrapper ul li div.home-faq-answer');
    $otherAnswerDivs = $answerDivs.filter((index) => {
        let div = $answerDivs[index];
        return div !== $currentAnswerDiv.get(0);
    });
    $otherAnswerDivs.slideUp(slideSpeed, slideEase);
    $currentAnswerDiv.slideToggle(slideSpeed, slideEase);
}

function validateEmailForm(e){
    if (!e.inputValid){
        e.preventDefault();
        let $emailInput = $(this).find('input[type="email"]')
        let email = $emailInput.val();
        if (email.includes('@')){
            let emailDomain = email.split('@')[1];
            if (emailDomain.includes('.')){
                if (emailDomain.split('.')[1]){
                    let submitEvent = $.Event('submit');
                    submitEvent.inputValid = true;
                    return $(this).trigger(submitEvent);
                }
            }
        }
        let message = 'Enter a valid email address!';
        let $messageSpan = $('<span>').text(message).addClass('validation-error overlay');
        let $parentDiv = $(this).find('.form-signup-input-wrapper');
        let $prevMessage = $parentDiv.find('.validation-error');
        if ($prevMessage.length !== 0){
            $prevMessage.remove();
        }
        $parentDiv.append($messageSpan);
        $emailInput.css({ borderBottom: '3px solid #f3c809' })
    }
}

function validateEmailInput(e){
    let inputValid = false;
    let email = $(this).val();
    if (email.length > 2){
        if (email.includes('@')){
            let emailDomain = email.split('@')[1];
            if (emailDomain.includes('.')){
                if (emailDomain.split('.')[1]){
                    inputValid = true;
                }
            }
        }
        let $parentDiv = $(this).closest('.form-signup-input-wrapper');
        let $prevMessage = $parentDiv.find('.validation-error');
        if (inputValid){
            if ($prevMessage.length !== 0){
                $prevMessage.remove();
                $(this).css({ borderBottom: '3px solid #fff'});
            }
        } else {
            if ($prevMessage.length === 0){
                let message = 'Enter a valid email address!';
                let $messageSpan = $('<span>').text(message).addClass('validation-error overlay');
                $parentDiv.append($messageSpan);
                $(this).css({ borderBottom: '3px solid #f3c809' });
            }
        }
    }
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

function signout(e){
    $.post('/signout')
        .done(() => {
            location.href = '/'
        })
}
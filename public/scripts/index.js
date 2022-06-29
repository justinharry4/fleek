$(setEventHandlers)

function setEventHandlers(){
    let $faqButtons = $('#home-faq-wrapper ul li div.home-faq-button');
    $faqButtons.on('click', showFaqAnswer)

    let $signupForm = $('.form-signup');
    $signupForm.on('submit', validateEmail)

    // let $emailInput = $('.form-signup input[type="email"]');
    // $emailInput.on('input', setHiddenInput)
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

function validateEmail(e){
    if (!e.inputValid){
        e.preventDefault();
        let $emailInput = $(this).find('input[type="email"]')
        let email = $emailInput.val();
        if (email.includes('@')){
            let emailDomain = email.split('@')[1];
            if (emailDomain.includes('.')){
                let submitEvent = $.Event('submit');
                submitEvent.inputValid = true;
                return $(this).trigger(submitEvent);
            }
        }
        let message = 'Enter a valid email address!';
        let $messageSpan = $('<span>').text(message).addClass('validation-error');
        let $parentLi = $(this).find('.form-signup-ul li');
        let $prevMessage = $parentLi.find('.validation-error');
        if ($prevMessage.length !== 0){
            $prevMessage.remove();
        }
        $parentLi.append($messageSpan);
        $emailInput.css({ borderBottom: '3px solid #f3c809' })
    }
}

// function setHiddenInput(e){
//     let $hiddenInput = $('.form-signup input[type="hidden"]');
//     let emailValue = $(this).val();
//     $hiddenInput.val(emailValue);
// }
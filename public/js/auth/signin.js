$(setEventHandlers);

function setEventHandlers(){
    let $inputs = $('#form-signin li input');
    $inputs.on('focus', animateInputLabel);
    $inputs.on('blur', animateInputLabel);
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


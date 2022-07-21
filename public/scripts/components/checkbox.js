initializeCheckbox()
console.log('checkbox script loaded!')
function initializeCheckbox(){
    let $nativeCheckbox = $('.custom-checkbox-wrapper .native-checkbox');
    let $customCheckmark = $('.custom-checkbox-wrapper .custom-checkmark');
    $nativeCheckbox.get().forEach(checkbox => {
        checkbox.checked = false;
    })
    setCheckBoxHandlers();
}

function setCheckBoxHandlers(){
    let $checkboxLabel = $('.custom-checkbox-wrapper').closest('label.custom-checkbox-container');
    $checkboxLabel.on('click', toggleCheckbox);

    let $nativeCheckbox = $('.custom-checkbox-wrapper .native-checkbox');
    $nativeCheckbox.on('click', preventNativeClick);
}

function toggleCheckbox(e){
    let $nativeCheckbox = $(this).find('.native-checkbox');
    let $customCheckmark = $(this).find('.custom-checkmark');
    let checkState;
    if ($customCheckmark.hasClass('checked-custom')){
        $customCheckmark.removeClass('checked-custom');
        $nativeCheckbox.get(0).checked = false;
        checkState = 'unchecked';
    } else {
        $customCheckmark.addClass('checked-custom');
        $nativeCheckbox.get(0).checked = true;
        checkState = 'checked';
    }
    let customCheckEvent = $.Event('customCheck:');
    customCheckEvent.checkState = checkState;
    $(this).trigger(customCheckEvent);
}

function preventNativeClick(e){
    e.stopPropagation();
    e.preventDefault();
}
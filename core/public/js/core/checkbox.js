function initializeCheckbox(){
    let $nativeCheckboxes = $('.custom-checkbox-wrapper .native-checkbox');
    $nativeCheckboxes.each((i, nativeCheckbox) => {
        let $customCheckmark = $(nativeCheckbox).siblings('.custom-checkmark');
        if (nativeCheckbox.checked){
            $customCheckmark.addClass('checked-custom');
        } else {
            $customCheckmark.removeClass('checked-custom');
        }
    })
    setCheckBoxHandlers();
}

function setCheckBoxHandlers(){
    let $checkboxLabels = $('.custom-checkbox-wrapper')
        .closest('label.custom-checkbox-container')
        .filter((i, label) => {
            let $nativeCheckbox = $(label).find('.native-checkbox');
            let isDisabled = $nativeCheckbox.attr('disabled') === 'disabled';
            return !isDisabled;
        });
    $checkboxLabels.on('click', toggleCheckbox);

    let $nativeCheckboxes = $('.custom-checkbox-wrapper .native-checkbox')
        .filter(':not([disabled])');
    $nativeCheckboxes.on('click', preventNativeClick);
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

export const checkboxInit = initializeCheckbox;
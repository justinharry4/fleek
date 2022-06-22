$(setEventHandlers);

function setEventHandlers(){
    let $proceedButton = $('.signup-main-wrapper button');
    $proceedButton.on('click', getNextPage);
}

function getNextPage(e){
    let url = '/auth/signup';
    let method = 'GET';
    let accountInfo = $(this).data('account-info');
    let stepNo = $(this).data('signup-pageno');
    let requestData = { 'signup-step': stepNo, accountInfo: accountInfo };
    if (accountInfo === 'credentials'){
        method = 'POST';
        let email = $('') // target email input;
        let password = $() // target password input;
        requestData = {} 
    } else if (accountInfo === 'subscription-plan'){

    } else if (accountInfo === 'credit-info'){
        
    }
    $.ajax({
        url: url,
        method: method,
        data: requestData,
        dataType: 'html',
    })
        .done(htmlData => {
            let $currentBody = $('#signup-toplevel-container');
            let $nextPage = $(htmlData);
            let $nextPageDivContainer = $nextPage.filter('#signup-toplevel-container');
            $nextPageDivContainer.css({
                right: '100%',
                position: 'relative'
            });
            $currentBody.html($nextPageDivContainer);
            $nextPageDivContainer.animate({right: '0%'}, 200);
        })
}
$(setEventHandlers);

function setEventHandlers(){
    let $proceedButtons = $('.signup-main-wrapper button');
    $proceedButtons.on('click', getNextPage);
}

function getNextPage(e){
    let url = '/auth/signup';
    let method = 'GET';
    let accountInfo = $(this).data('account-info');
    let stepNo = $(this).data('signup-stepno');
    let requestData = { 'signup-step': stepNo, accountInfo: accountInfo };
    // if (accountInfo === 'credentials'){
    //     // method = 'POST';
    //     // let email = $('') // target email input;
    //     // let password = $() // target password input;
    //     // requestData = {stepNo: 10} 
    // } else if (accountInfo === 'subscription-plan'){

    // } else if (accountInfo === 'credit-info'){
        
    // }
    console.log(url);
    console.log(method);
    console.log(requestData);
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
            setEventHandlers();
        })
}

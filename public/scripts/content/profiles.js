$(initializePage);

// INITIALIZATION 
function initializePage(){
    $(window).on('popstate', showPageInHistory);
    window.stateData = {};

    let $lowDiv = $('#lowlevel-container');
    let fragmentName = $lowDiv.data('fragment-name');
    let stateObject = { ref: fragmentName };
    window.stateData[fragmentName] = $lowDiv;
    history.replaceState(stateObject, '');

    setTimeout(() => $lowDiv.removeClass('zoom'), 1);

    setEventHandlers();
}

// UTILITY FUNCTIONS
function setHistoryState(){
    let $lowDiv = $('#lowlevel-container');
    let fragmentName = $lowDiv.data('fragment-name');
    let stateObject = { ref: fragmentName };
    window.stateData[fragmentName] = $lowDiv;
    history.pushState(stateObject, '');
}

// SET EVENT HANDLERS
function setEventHandlers(){
    let profileWrappers = $('.profile-wrapper');
    profileWrappers.on('mouseenter', highlightProfile);
    profileWrappers.on('mouseleave', unhighlightProfile);

    let $addProfileWrapper = $('.add-profile-wrapper');
    $addProfileWrapper.on('click', showAddProfile);

    console.log(history.state, window.stateData);
}

// EVENT HANDLERS
// window event handlers
function showPageInHistory(e){
    let fragmentName = history.state.ref;
    let fragmentLowDiv = window.stateData[fragmentName];
    let currentLowDiv = $('#lowlevel-container');

    currentLowDiv.replaceWith(fragmentLowDiv);
    setTimeout(() => {
        fragmentLowDiv.removeClass('zoom')
    }, 1);
    currentLowDiv.addClass('zoom');

    setEventHandlers();
}

// document event handlers
function highlightProfile(e){
    let $profileElements = $(this).find('> *, svg path');
    let $profileImg = $(this).find('img');

    $profileElements.addClass('highlight');
    $profileImg.css({ borderRadius: '0px' })
    
}

function unhighlightProfile(e){
    let $profileElements = $(this).find('> *, svg path');
    let $profileImg = $(this).find('img');

    $profileElements.removeClass('highlight');
    $profileImg.css({ borderRadius: '4px' })
}

async function showAddProfile(e){
    try {
        let htmlData = await $.get('/addprofile');
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlData, 'text/html');
        let $addProfileDoc = $(htmlDoc);

        let $currentLowDiv = $('#lowlevel-container');
        let $addProfileLowDiv = $($addProfileDoc).find('#lowlevel-container');

        $currentLowDiv.replaceWith($addProfileLowDiv);
        setTimeout(() => {
            $addProfileLowDiv.removeClass('zoom');
        }, 1);
        $currentLowDiv.addClass('zoom');

        setHistoryState();
        setEventHandlers()
    } catch (jqXHR){
        console.log('FAIL', jqXHR);
    }
}
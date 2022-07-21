$(initializePage);

// INITIALIZATION 
function initializePage(){
    $(window).on('popstate', showPageInHistory);
    window.stateData = {};

    let $lowDiv = $('#lowlevel-container');
    let $styleSheetLinks = $('link[rel="stylesheet"]');
    let $scripts = $('script');

    let stateElements = { 
        containerDiv: $lowDiv,
        styleSheetLinks: $styleSheetLinks,
        scripts: $scripts
    };

    let fragmentName = $lowDiv.data('fragment-name');
    let stateObject = { ref: fragmentName };
    window.stateData[fragmentName] = stateElements;
    history.replaceState(stateObject, '');

    setTimeout(() => $lowDiv.removeClass('zoom'), 1);

    setEventHandlers();
}

// UTILITY FUNCTIONS
function setHistoryState(){
    let $lowDiv = $('#lowlevel-container');
    let $styleSheetLinks = $('link[rel="stylesheet"]');
    let $scripts = $('script');

    let stateElements = { 
        containerDiv: $lowDiv,
        styleSheetLinks: $styleSheetLinks,
        scripts: $scripts
    };

    let fragmentName = $lowDiv.data('fragment-name');
    let stateObject = { ref: fragmentName };
    window.stateData[fragmentName] = stateElements;
    history.pushState(stateObject, '');
}

function startPageLoad(stateElements, levelSelector, setHistory){
    let $newStyleSheetLinks = stateElements.styleSheetLinks;
    let $newScripts = stateElements.scripts;
    let $newContainerDiv = stateElements.containerDiv;

    let $styleSheetLinks = $('link[rel="stylesheet"]');
    let $scripts = $('script');
    let $containerDiv = $(levelSelector);
    
    let newResources = [$newStyleSheetLinks, $newScripts];
    let nonRepeatedLinks = [];
    let existingLinks = [];
    let nonRepeatedScripts = [];
    let existingScripts = [];
    for (let [i, $newResourceElements] of newResources.entries()){
        let $resources, attr, nonRepeated, existing;
        if (i === 0){
            attr = 'href'
            $resources = $styleSheetLinks;
            nonRepeated = nonRepeatedLinks;
            existing = existingLinks;
        } else {
            attr = 'src'
            $resources = $scripts;
            nonRepeated = nonRepeatedScripts;
            existing = existingScripts;
        }

        $newResourceElements.each((index, element) => {
            let present = false;
            let newResourceURL = $(element).attr(attr);

            for (let resource of $resources.get()){
                let resourceURL = $(resource).attr(attr)
                if (newResourceURL === resourceURL){
                    present = true;
                    break;
                }
            }
            if (present){
                existing.push(element);
            } else {
                nonRepeated.push(element);
            }
        })
    }

    let completePageLoadArgs = {
        $styleSheetLinks,
        $scripts,
        $newContainerDiv, 
        $containerDiv, 
        nonRepeatedScripts,
        existingLinks,
        existingScripts,
    };

    let linkLoadCount = 0;
    if (nonRepeatedLinks.length > 0){
        let fired = false;
        let timeoutID = setTimeout(() => {
            if (!fired){
                completePageLoad(completePageLoadArgs, setHistory);
            }
        }, 200);

        $(nonRepeatedLinks).on('load', function() {
            linkLoadCount++;
            if (linkLoadCount === nonRepeatedLinks.length && !fired){
                clearTimeout(timeoutID);
                fired = true;
                completePageLoad(completePageLoadArgs, setHistory);
            }
        });
    }
    nonRepeatedLinks.forEach(element => {
        $('head').append(element);
    });
    $containerDiv.remove();

    if (!(nonRepeatedLinks.length > 0)){
        completePageLoad(completePageLoadArgs, setHistory);
    }
}

function completePageLoad(args, setHistory){
    let { $styleSheetLinks, $scripts, $newContainerDiv } = args;
    let { $containerDiv, nonRepeatedScripts, existingLinks } = args;
    let { existingScripts } = args;

    $('#toplevel-container').append($newContainerDiv);
    setTimeout(() => $newContainerDiv.removeClass('zoom'), 10);
    $containerDiv.addClass('zoom');

    nonRepeatedScripts.forEach(element => {
        let $element = $(element);
        let src = $(element).attr('src');
        let $script = $('<script>').attr('src', src);
    
        $('head').append($script);
        $element.remove();
    });

    let nonRequiredLinks = $styleSheetLinks.get().filter(element => {
        let required = false;
        for (let e of existingLinks){
            if ($(element).attr('href') === $(e).attr('href')){
                required = true;
                break;
            }
        }
        return !required;
    })
    let jqueryUrl = '/scripts/modules/jquery.js';
    let mainScriptUrl = '/scripts/content/profiles.js';
    let nonRequiredScripts = $scripts.get().filter(element => {
        let required = false;
        let src = $(element).attr('src');
        for (let e of existingScripts){
            if (src === $(e).attr('src') || src === jqueryUrl || src === mainScriptUrl){
                required = true;
                break;
            }
        }
        return !required;
    })

    $(nonRequiredLinks).remove();
    $(nonRequiredScripts).remove();

    if (setHistory){
        setHistoryState();
    }
    setEventHandlers();
}

function adjustAddProfileHoverState(){
    let $addProfileWrapper = $('.add-profile-wrapper');
    let $addProfileWrapperHover = $('.add-profile-wrapper:hover');

    let $profileElement = $($addProfileWrapper.find('> *').get(0));
    let isHighlighted = $profileElement.hasClass('highlight');
    if ($addProfileWrapperHover.length === 0 && isHighlighted){
        $addProfileWrapper.trigger('mouseleave');
        console.log('mouseleave triggered')
    }
}

// SET EVENT HANDLERS
function setEventHandlers(){
    let $profileWrappers = $('.profile-wrapper');
    $profileWrappers.on('mouseenter', highlightProfile);
    $profileWrappers.on('mouseleave', unhighlightProfile);

    let $addProfileWrapper = $('.add-profile-wrapper');
    $addProfileWrapper.on('click', showAddProfile);

    adjustAddProfileHoverState();
}

// EVENT HANDLERS
// window event handlers
function showPageInHistory(e){
    let fragmentName = history.state.ref;
    let stateElements = window.stateData[fragmentName];

    startPageLoad(stateElements, '#lowlevel-container');
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
        let htmlData = await $.get('/profile/addprofile');
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlData, 'text/html');

        let $lowDiv = $(htmlDoc).find('#lowlevel-container');
        let $styleSheetLinks = $(htmlDoc).find('link[rel="stylesheet"]');
        let $scripts = $(htmlDoc).find('script');

        let stateElements = { 
            containerDiv: $lowDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts
        };
        let setHistory = true
        startPageLoad(stateElements, '#lowlevel-container', setHistory);
    } catch (jqXHR){
        console.log('FAIL', jqXHR);
    }
}
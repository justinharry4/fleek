// This file defines utility functions for more efficient page loads

function addListener(element, eventName, eventListener, eventData){
    let jqObject = element.jquery ? element : $(element);
    jqObject.off(eventName);
    jqObject.on(eventName, eventData, eventListener);
}

function showError(message){
    if (!message){
        message = 'The requested action could not be completed.';
    }

    let $errorDiv = $('<div>')
        .text(message)
        .addClass('pageLoad-error');
        $('body').append($errorDiv);
}

function genericAJAXRequest(method, url, data){
    let promise = new Promise((resolve, reject) => {
        let jqXHR = $[method](url, data);

        jqXHR.done(resData => {
            resolve({ jqXHR, resData })
        });
        jqXHR.fail(() => {
            reject({ jqXHR });
        });
    });
    
    return promise;
}

async function get(url, data){
    let result =  await genericAJAXRequest('get', url, data);
    return result;
}

async function post(url, data){   
    let result = await genericAJAXRequest('post', url, data);
    return result;
}


function loadPageFromHTML(HTMLStr,
                          levelSelector,
                          mainFragmentName,
                          setHistory,
                          stateUrl,
                          trueUrl,
                          setPageState){
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(HTMLStr, 'text/html');

    let $lowDiv = $(htmlDoc).find(levelSelector);
    let $styleSheetLinks = $(htmlDoc).find('link[rel="stylesheet"]');
    let $scripts = $(htmlDoc).find('script');

    let stateElements = { 
        containerDiv: $lowDiv,
        styleSheetLinks: $styleSheetLinks,
        scripts: $scripts
    };

    let $eventGateElement = $('<div>');

    $eventGateElement.on('customSendPage:', async (e) => {
        let page = e.eventData.page;
        try {
            await page.loadPage(
                stateElements,
                levelSelector,
                'ajax',
                setHistory,
                stateUrl,
                trueUrl,
                setPageState,
            );
        } catch(error){
            console.log(error.message);
            showError(error.message);
        }
    });

    console.log('in lfhtml', mainFragmentName);
    let requestPageEvent = $.Event('customRequestPage:');
    requestPageEvent.eventData = {
        element: $eventGateElement,
        fragmentName: mainFragmentName
    };
    
    $(window).trigger(requestPageEvent);
}


const ajax = { get, post }

export {
    addListener,
    showError,
    loadPageFromHTML,
    ajax,
}
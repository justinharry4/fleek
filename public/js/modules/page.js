// This class manages page state data accessed through
// the `history.state` reference in the page sript.

class PageManager {
    constructor(originFragmentName, pageLoadTimeout=20000){
        this.originFragmentName = originFragmentName;
        this.pageLoadTimeout = pageLoadTimeout;
        this.jquerySource = '/scripts/modules/jquery.js';
        this.state = {};
    }

    saveState(levelSelector, url, trueUrl, setPageState=true){
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');
        let stateObject = { ref: fragmentName, url: trueUrl };

        if (setPageState){
            this.state[fragmentName] = stateElements;
        }

        history.replaceState(stateObject, '', url);
    }

    saveNewState(levelSelector, url, trueUrl, setPageState=true){
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');
        let stateObject = { ref: fragmentName, url: trueUrl };

        if (setPageState){
            this.state[fragmentName] = stateElements;
        }
        
        history.pushState(stateObject, '', url);
    }

    loadPage(stateElements, levelSelector, fetchType, setHistory, stateUrl, trueUrl){
        let $newStyleSheetLinks = stateElements.styleSheetLinks;
        let $newScripts = stateElements.scripts;
        let $newContainerDiv = stateElements.containerDiv;
    
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');
        let $containerDiv = $(levelSelector);
        let $containerDivParent = $containerDiv.parent();
        let $transitionElements = $containerDiv.find('#lowlevel-container');
        
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
            $containerDivParent,
            nonRepeatedScripts,
            existingLinks,
            existingScripts,
            levelSelector,
            stateUrl,
            trueUrl,
        };
        
        let promise = new Promise((resolve, reject) => {
            let promiseTimeoutID = setTimeout(() => {
                let error = new Error('page load process timed out');
                reject(error);
            }, this.pageLoadTimeout);

            let promiseArgs = { resolve, promiseTimeoutID }
            let linkLoadCount = 0;
            if (nonRepeatedLinks.length > 0 && fetchType === 'ajax'){
                $(nonRepeatedLinks).on('load', () => {
                    linkLoadCount++;
                    if (linkLoadCount === nonRepeatedLinks.length){
                        this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
                    }
                });
            }
        
            nonRepeatedLinks.forEach(element => {
                $('head').append(element);
            });
            $containerDiv.remove();
            // $transitionElement.addClass('zoom');
            $transitionElements.each((index, element) => {
                let transitionClass = $(element).data('transition-class');
                $(element).toggleClass(transitionClass);
            });
        
            if (nonRepeatedLinks.length > 0 && fetchType === 'state'){
                setTimeout(() => {
                    this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
                }, 200);
            } else if (!(nonRepeatedLinks.length > 0)){
                this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
            }
        })

        return promise;
    }
    
    _completePageLoad(args, setHistory, promiseArgs){
        let { $styleSheetLinks, $scripts, $newContainerDiv } = args;
        let { $containerDivParent, nonRepeatedScripts, existingLinks } = args;
        let { existingScripts, levelSelector, stateUrl, trueUrl } = args;
        let { resolve, promiseTimeoutID } = promiseArgs;
        
        $containerDivParent.append($newContainerDiv);
        setTimeout(() => {
            // $newTransitionElement.removeClass('zoom')
            let $newTransitionElements = $newContainerDiv.find('.transZero');
            $newTransitionElements.each((index, element) => {
                let transitionClass = $(element).data('transition-class');
                $(element).toggleClass(transitionClass);
            });
        }, 10);
    
        nonRepeatedScripts.forEach(element => {
            let $element = $(element);
            let src = $element.attr('src');
            let type = $element.attr('type');
            let $script = $('<script>')
                .attr('src', src)
                .attr('type', type)
                .attr('data-fetchmethod', 'async');
        
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
        
        let requiredUrls = [this.jquerySource];
        let nonRequiredScripts = $scripts.get().filter(element => {
            let required = false;
            let src = $(element).attr('src');
            for (let e of existingScripts){
                if (src === $(e).attr('src') || requiredUrls.includes(src)){
                    required = true;
                    break;
                }
            }
            return !required;
        })
    
        $(nonRequiredLinks).remove();
        $(nonRequiredScripts).remove();

        if (setHistory){
            this.saveNewState(levelSelector, stateUrl, trueUrl);
        }
        
        let $eventGateElement = $('<div>');

        $eventGateElement.on('customSendSetHandlersFn:', (e) => {

            let setHandlersFn = e.eventData.setHandlersFn;
            if (setHandlersFn){
                setHandlersFn();
            }

            clearTimeout(promiseTimeoutID);
            resolve({pageLoadStatus: 'complete'});
        })

        let fragmentName = $(levelSelector).data('fragment-name');

        let requestSetHandlersEvent = $.Event('customRequestSetHandlersFn:');
        requestSetHandlersEvent.eventData = { 
            fragmentName: fragmentName,
            element: $eventGateElement
        };

        $(window).trigger(requestSetHandlersEvent);
    }

    static setWindowEventListeners(){
        let mainPopstateListener = async (e) => {
            let fragmentLoaded = false;
            for (let pageEntry of pageList){
                try {
                    if (pageEntry.listener){
                        await pageEntry.listener(pageEntry.page);
                        fragmentLoaded = true;
                        break;
                    }
                } catch(error) {
                    console.log(error.message);
                    if (error.code === 0){
                        continue;
                    } else if (error.code === 1){
                        PageManager.showError(error.message);
                        console.log(error);
                    }
                }
            }

            if (!fragmentLoaded){
                let url = history.state.url;
                let fragmentName = $('#toplevel-container').data('fragment-name');
                console.log(url, 'fname =>', fragmentName);
                try {
                    let HTMLStr = await $.get(url);

                    PageManager.loadPageFromHTML(
                        HTMLStr,
                        '#toplevel-container',
                        fragmentName,
                        false
                    );
                } catch(error){
                    console.log(error.message);
                    PageManager.showError(error.message);
                }
            }
        }

        let addPopstateListener = (e) => {
            let fragmentNames = pageList.map(p => p.fragmentName);
            let fragmentName = e.eventData.fragmentName;

            if (fragmentNames.includes(fragmentName)) return;

            pageList.unshift(e.eventData);
        }

        let getPage = (e) => {
            let fragmentName = e.eventData.fragmentName;
            let $element = e.eventData.element;
            let [ page ] = pageList
                .filter(p => p.fragmentName === fragmentName)
                .map(p => p.page);
            
            let sendPageEvent = $.Event('customSendPage:');
            sendPageEvent.eventData = { page: page};
            $element.trigger(sendPageEvent);
        }

        let getSetHandlersFn = (e) => {
            let fragmentName = e.eventData.fragmentName;
            let $element = e.eventData.element;
            let entry = setHandlersFnList
                .find(entry => entry.fragmentName === fragmentName);
            let setHandlersFn;

            if (entry){
                setHandlersFn = entry.setHandlersFn;
            }

            let sendSetHandlersEvent = $.Event('customSendSetHandlersFn:');
            sendSetHandlersEvent.eventData = { setHandlersFn: setHandlersFn };
            $element.trigger(sendSetHandlersEvent);
        }

        let addSetHandlersFn = (e) => {
            let fragmentName = e.eventData.fragmentName;
            let fragmentNames = setHandlersFnList
                .map(entry => entry.fragmentName);

            if (fragmentNames.includes(fragmentName)) return;

            setHandlersFnList.push(e.eventData);
        }
    
        $(window).on('popstate', mainPopstateListener);
        $(window).on('customAddListener:', addPopstateListener);
        $(window).on('customRequestPage:', getPage);
        $(window).on('customRequestSetHandlersFn:', getSetHandlersFn);
        $(window).on('customAddSetHandlersFn:', addSetHandlersFn);

        let pageList = [];
        let setHandlersFnList = [];
        // mainPopstateListener.pageList = [];
        // mainPopstateListener.setHandlersFnList = [];
    }

    static triggerInitWindowEvents(mainFragmentName, page, showHistoryPageFn, setHandlersFn){
        let customAddListenerEvent = $.Event('customAddListener:');
        customAddListenerEvent.eventData = { 
            fragmentName: mainFragmentName,
            page: page,
            listener: showHistoryPageFn 
        };
        $(window).trigger(customAddListenerEvent);

        let addSetHandlersFnEvent = $.Event('customAddSetHandlersFn:');
        addSetHandlersFnEvent.eventData = {
            fragmentName: mainFragmentName,
            setHandlersFn: setHandlersFn,
        };
        $(window).trigger(addSetHandlersFnEvent);
    }

    static async showHistory(page, levelSelector){
        let fragmentName = history.state.ref;
        let stateElements = page.state[fragmentName];

        if (!fragmentName || !stateElements){
            let error = new Error('history page fragment not found.');
            error.code = 0; // code 0 => page fragment Not found
            throw error;
        }
        
        try {
            await page.loadPage(stateElements, levelSelector, 'state');
        } catch(error) {
            error.code = 1; // code 1 => page load timed out
            throw error;
        }
    }

    static loadPageFromHTML(HTMLStr, levelSelector, mainFragmentName, setHistory, stateUrl, trueUrl){
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
                );
            } catch(error){
                console.log(error.message);
                PageManager.showError(error.message);
            }
        });

        let requestPageEvent = $.Event('customRequestPage:');
        requestPageEvent.eventData = {
            element: $eventGateElement,
            fragmentName: mainFragmentName
        };
        
        $(window).trigger(requestPageEvent);
    }

    static showError(message){
        let $errorDiv = $('<div>')
            .text(message)
            .addClass('pageLoad-error');
            $('body').append($errorDiv);
    }
}

function addListener(element, eventName, eventListener, eventData){
    let jqObject = element.jquery ? element : $(element);
    jqObject.off(eventName);
    jqObject.on(eventName, eventData, eventListener);
}

export { PageManager, addListener };
// This class manages page state data accessed through
// the `history.state` reference in the page sript.

class PageManager {
    constructor(pageLoadTimeout=20000){
        this.jquerySource = '/scripts/modules/jquery.js';
        this.state = {};
        this.pageLoadTimeout = pageLoadTimeout;
    }

    saveState(levelSelector, url, setPageState=true){
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');
        let stateObject = { ref: fragmentName };

        if (setPageState){
            this.state[fragmentName] = stateElements;
        }

        history.replaceState(stateObject, '', url);
        // let fragmentName = $containerDiv.data('fragment-name');
        // let stateObject = { ref: fragmentName };

        // if (setPageState){
        //     if (!this.state[fragmentName]){
        //         this.state[fragmentName] = {};
        //     }
        //     let stateElements = this.state[fragmentName];
        //     stateElements.containerDiv = $containerDiv;
        //     stateElements.styleSheetLinks = $styleSheetLinks;
        //     stateElements.scripts = $scripts;
        //     if (setHandlersFn){
        //         stateElements.setHandlersFn = setHandlersFn;
        //     }
        //     // this.state[fragmentName] = stateElements;
        // }
    }

    saveNewState(levelSelector, url, setPageState=true){
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');
        let stateObject = { ref: fragmentName };

        if (setPageState){
            this.state[fragmentName] = stateElements;
        }
        
        history.pushState(stateObject, '', url);

        // let fragmentName = $containerDiv.data('fragment-name');
        // let stateObject = { ref: fragmentName };

        // if (setPageState){
        //     if (!this.state[fragmentName]){
        //         this.state[fragmentName] = {};
        //     }
        //     let stateElements = this.state[fragmentName];
        //     stateElements.containerDiv = $containerDiv;
        //     stateElements.styleSheetLinks = $styleSheetLinks;
        //     stateElements.scripts = $scripts;
        //     if (setHandlersFn){
        //         stateElements.setHandlersFn = setHandlersFn;
        //     }
        // }
    }

    loadPage(stateElements, levelSelector, fetchType, setHistory){
        let $newStyleSheetLinks = stateElements.styleSheetLinks;
        let $newScripts = stateElements.scripts;
        let $newContainerDiv = stateElements.containerDiv;
    
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');
        let $containerDiv = $(levelSelector);
        let $containerDivParent = $containerDiv.parent();
        
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
                        console.log('fetchtype -> ajax');
                        this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
                    }
                });
            }
        
            nonRepeatedLinks.forEach(element => {
                $('head').append(element);
            });
            $containerDiv.remove();
            $containerDiv.addClass('zoom');
        
            if (nonRepeatedLinks.length > 0 && fetchType === 'state'){
                setTimeout(() => {
                    console.log('fetchtype -> state');
                    this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
                }, 200);
            } else if (!(nonRepeatedLinks.length > 0)){
                console.log('no fresh links');
                this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
            }
        })

        return promise;
    }
    
    _completePageLoad(args, setHistory, promiseArgs){
        let { $styleSheetLinks, $scripts, $newContainerDiv } = args;
        let { $containerDivParent, nonRepeatedScripts, existingLinks } = args;
        let { existingScripts, levelSelector } = args;
        let { resolve, promiseTimeoutID } = promiseArgs;
    
        $containerDivParent.append($newContainerDiv);
        setTimeout(() => $newContainerDiv.removeClass('zoom'), 10);
    
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
            this.saveNewState(levelSelector);
        }
        // if (setHandlersFn){
        //     setHandlersFn();
        // }
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
            console.log('main popstate ran');

            for (let pageEntry of pageList){
                try {
                    await pageEntry.listener(pageEntry.page);
                    break;
                } catch(error) {
                    console.log(error.message);
                    if (error.code === 0){
                        continue;
                    } else if (error.code === 1){
                        PageManager.showPageLoadError(error.message);
                    }
                }
            }
        }

        let addPopstateListener = (e) => {
            console.log('custom popstate ran')
    
            let fragmentNames = pageList.map(p => p.fragmentName);
            let fragmentName = e.eventData.fragmentName;

            if (fragmentNames.includes(fragmentName)) return;

            pageList.unshift(e.eventData);
        }

        let getPage = (e) => {
            console.log('getpage ran');

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
            console.log('setHandlers requested');
            
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
            console.log('addsethandlersfn ran');
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

    static showPageLoadError(message){
        let $errorDiv = $('<div>')
            .text(message).addClass('pageLoad-error');
            $('body').append($errorDiv);
    }
}

console.log('end of page module');

export { PageManager };
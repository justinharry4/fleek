/*  This module defines tools used to manage pages in the browser.

    The functionality these tools provide help manage page loads,
    track history and register event listeners efficiently.
*/

import { addListener, showError, loadPageFromHTML } from '/js/core/utils.js'


async function popstateListener(e){
    let pageList = e.data;

    let fragmentLoaded = false;
    for (let page of pageList){
        try {
            if (page.showHistory){
                await page.showHistory();
                fragmentLoaded = true;
                break;
            }
        } catch(error) {
            console.log(error.message);
            if (error.code === 0){
                continue;
            } else if (error.code === 1){
                showError(error.message);
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

            loadPageFromHTML(
                HTMLStr,
                '#toplevel-container',
                fragmentName,
                false
            );
        } catch(error){
            console.log(error.message);
            showError(error.message);
        }
    }
}

function addPage(e){
    let pageList = e.data;

    let fragmentNames = pageList.map(p => p.mainFragmentName);
    let fragmentName = e.eventData.page.mainFragmentName;

    if (fragmentNames.includes(fragmentName)) return;

    pageList.unshift(e.eventData.page);
}

function getPage(e){
    let pageList = e.data;

    let fragmentName = e.eventData.fragmentName;
    let $element = e.eventData.element;
    let [ page ] = pageList.filter(p => p.mainFragmentName === fragmentName);
        
    let sendPageEvent = $.Event('customSendPage:');
    sendPageEvent.eventData = { page: page };
    $element.trigger(sendPageEvent);
}

function setWindowEventListeners(){
    let pageList = [];

    $(window).on('popstate', pageList, popstateListener);
    $(window).on('customAddPage:', pageList, addPage);
    $(window).on('customRequestPage:', pageList,  getPage);
}


class Page {
    constructor(){
        this.jquerySource = '/scripts/modules/jquery.js';
        this.pageLoadTimeout = 20000;
        
        // initialize empty page state object
        this.state = {};

        this.setPageProperties();

        this.initializePage();
    }

    initializePage(){
        // get fetchmethod for the document containing the
        // script element linked to the running JS file
        let $currentScript = $('script').filter(`[src="${this.source}"]`);
        let fetchMethod = $currentScript.data('fetchmethod');
        
        // if fetchmethod is `native`, run page initialization code 
        if (fetchMethod === 'native'){
            console.log('if block entered', this.trueURL);
            setWindowEventListeners();
            this.saveState('#toplevel-container', null, this.trueURL);
            this.showInitialTransition();
        }

        this.setEventHandlers();

        // register current page by adding to `window`-managed `pageList`
        let customAddPageEvent = $.Event('customAddPage:');
        customAddPageEvent.eventData = { page: this };

        $(window).trigger(customAddPageEvent);
    }

    showInitialTransition(){
        setTimeout(() => {
            let $transitionElements = $('body').find('.transZero');

            $transitionElements.each((index, element) => {
                let transitionClass = $(element).data('transition-class');
                $(element).toggleClass(transitionClass);
            });
        }, 1);
    }

    setEventHandlers(){
        let eventData = { page: this };
        let eventMap = this.getEventMap();

        // event map structure => [[selector, event, handler], [.., .., ..], ..]
        for (let eventEntry of eventMap){
            let [selector, event, handler] = eventEntry;

            if (typeof handler === 'string'){
                addListener($(selector), event, this[handler], eventData);
            } else if (typeof handler === 'boolean'){
                addListener($(selector), event, handler, eventData);
            }
        }

        console.log('super set handlers run');
    }

    async showHistory(){
        let fragmentName = history.state.ref;
        let stateElements = this.state[fragmentName];

        if (!fragmentName || !stateElements){
            let error = new Error('history page fragment not found.');
            error.code = 0; // code 0 => page fragment Not found
            throw error;
        }
        
        try {
            await this.loadPage(stateElements, '#toplevel-container', 'state');
        } catch(error) {
            error.code = 1; // code 1 => page load timed out
            throw error;
        }
    }

    saveState(levelSelector, url, trueUrl, setPageState=true){
        /*  This function registers the present DOM elements in 
            the page state object `page.state`. This is later 
            fetched through the browser history state entry 
            `history.state`, which is set here using `history.replaceState`.

            `history.replaceState` sets state information for the 
            current entry in the browser history.
        */

        /*  PARAMS
            `levelSelector`: selector string to match container element
                             to be registered.
            `url`:           URL passed to `history.replaceState()`. This is
                             the URL displayed in the browser navigation bar.
            `trueUrl:        This is the actual URL that points to the page
                             resource's location on the server.
            `setPageState`:  Boolean. Determines if DOM elements are registered
                             as page state.
        */

        // fetch current DOM elements
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        // define DOM info object to be registered as page state
        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');

        // define state object to which `history.state` is set
        let stateObject = { ref: fragmentName, url: trueUrl };

        // register DOM info object as page state if `setPageState` is `true`
        if (setPageState){
            this.state[fragmentName] = stateElements;
        }

        history.replaceState(stateObject, '', url);
    }

    saveNewState(levelSelector, url, trueUrl, setPageState=true){
        /*  This function registers present the DOM elements in 
            the page state object `page.state`. This is later 
            fetched through the browser history state entry 
            `history.state`, which is set here using `history.pushState`.

            `history.pushState` sets state information for a new
            entry in the browser history.
        */

        /*  PARAMS
            `levelSelector`: selector string to match container element
                             to be registered.
            `url`:           URL passed to `history.pushState()`. This is
                             the URL displayed in the browser navigation bar.
            `trueUrl:        This is the actual URL that points to the page
                             resource's location on the server.
            `setPageState`:  Boolean. Determines if DOM elements are registered
                             as page state.
        */

        // fetch current DOM elements
        let $containerDiv = $(levelSelector);
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');

        // define DOM info object to be registered as page state
        let stateElements = { 
            containerDiv: $containerDiv,
            styleSheetLinks: $styleSheetLinks,
            scripts: $scripts,
        };

        let fragmentName = $containerDiv.data('fragment-name');

        // define state object to which `history.state` is set
        let stateObject = { ref: fragmentName, url: trueUrl };

        // register DOM info object as page state if `setPageState` is `true`
        if (setPageState){
            this.state[fragmentName] = stateElements;
        }
        
        history.pushState(stateObject, '', url);
    }

    async loadPage(...args){
        try {
            await this._startPageLoad(...args);
        } catch(error) {
            console.log(error);
        }
    }

    _startPageLoad(stateElements, levelSelector, fetchType, setHistory, stateUrl, trueUrl){
        /*  This function carries out the first part of a
            two-part process to replace the present DOM elements
            with elements from a different document. 
            In other words, the 'two-part process' here loads a new page.
        */

        /*  PARAMS:
            `stateElements`: DOM info object like from `page.state`.
            `levelSelector`: selector string to match container object
                             to be replaced/added.
            `fetchType`:     page load mode string. One of [`ajax`, `state`]
            `setHistory`:    Boolean. Determines if `.saveNewState()` is
                             called after page load.
            `stateUrl`:      URL ultimately passed to `history.replaceState()`
                             or `history.pushState()`. 
            `trueUrl`:       URL ultimately passed to `.saveState()` or 
                             `.saveNewState()` as the `trueUrl` parameter.
                             This is the actual URL that points to the loaded
                             page's location on the server.
        */

        // get page state DOM elements of new page to be loaded.
        let $newStyleSheetLinks = stateElements.styleSheetLinks;
        let $newScripts = stateElements.scripts;
        let $newContainerDiv = stateElements.containerDiv;
        
        // get page state DOM elements of current page (to be replaced).
        let $styleSheetLinks = $('link[rel="stylesheet"]');
        let $scripts = $('script');
        let $containerDiv = $(levelSelector);

        let $containerDivParent = $containerDiv.parent();

        // get elements with initial page load transition styles.
        let $transitionElements = $containerDiv.find('.transZero');
        // let $transitionElements = $containerDiv.find('#lowlevel-container');
        
        let newResources = [$newStyleSheetLinks, $newScripts];
        let nonRepeatedLinks = [];
        let existingLinks = [];
        let nonRepeatedScripts = [];
        let existingScripts = [];

        // loop through array of new resource elements (script and link elements)
        // to identify resources already present in the current DOM and those
        // that are not.
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
        
        // define args object containing variables to be passed on to 
        // `._completePageLoad()` to complete the page load process.
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
        
        // Promise created to be resolved when the entire page load process
        // has been completed.

        // A promise is used here because code execution from this point may
        // no longer be entirely synchronous as it becomes partly event-driven.
        let promise = new Promise((resolve, reject) => {
            // set timeout to satisfy promise in the event that the page load
            // takes an unusually long time to complete.
            let promiseTimeoutID = setTimeout(() => {
                let error = new Error('page load process timed out');
                reject(error);
            }, this.pageLoadTimeout);

            // define args object containing promise-related variables
            // to be passed on to `._completePageLoad()` to complete the
            // page load process.
            let promiseArgs = { resolve, promiseTimeoutID }

            // register 'onload' event handler to be called when all new `<link>`
            // elements have been loaded into the DOM.
            // This handler ultimately calls `._completePageLoad()` to start the 
            // second part of the page load process.

            // This handler is set only in the case of an AJAX request for a
            // new page. This is because in other scenarios, like fetching a page from
            // a page state registry, the `<link>` elements would be loaded already.
            let linkLoadCount = 0;
            if (nonRepeatedLinks.length > 0 && fetchType === 'ajax'){
                $(nonRepeatedLinks).on('load', () => {
                    linkLoadCount++;
                    if (linkLoadCount === nonRepeatedLinks.length){
                        this._completePageLoad(completePageLoadArgs, setHistory, promiseArgs);
                    }
                });
            }
            
            // add new `<link>` elements to the DOM.
            nonRepeatedLinks.forEach(element => {
                $('head').append(element);
            });
            // remove current container element from the DOM.
            $containerDiv.remove();

            // toggle transition-controlling classes in elements 
            // just removed from the DOM.
            // This reverts their transitions to the initial state.
            $transitionElements.each((index, element) => {
                let transitionClass = $(element).data('transition-class');
                $(element).toggleClass(transitionClass);
            });
            
            // call `._completePageLoad()` if a page is loaded from a 
            // page state registry or if there are no new `<link>` elements
            // to be loaded. 
            // This starts the second part of the page load process.

            // a handler for `<link>` onload events is not required here
            // because the links are loaded already in these scenarios.
            if (nonRepeatedLinks.length > 0 && fetchType === 'state'){
                // a delay is required here because, when loading a page from
                // a page state registry, the DOM elements fetched from the
                // registry are rendered on the screen faster than the styles 
                // in the style sheet can take effect. 

                // The delay from the timeout acts to prevent a noticeable lag.
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
        /*  This function carries out the second part of a
            two-part process to replace the present DOM elements
            with elements from a different document. 
            In other words, the 'two-part process' here loads a new page.
        */

        /*  PARAMS
            `setHistory`: Boolean. Determines if `.saveNewState()` is
                          called after page load.
        */

        let { $styleSheetLinks, $scripts, $newContainerDiv } = args;
        let { $containerDivParent, nonRepeatedScripts, existingLinks } = args;
        let { existingScripts, levelSelector, stateUrl, trueUrl } = args;
        let { resolve, promiseTimeoutID } = promiseArgs;
        
        /*  DESTRUCTURED VARIABLES
            `$styleSheetLinks`:    `<link>` elements from the previous page
                                   (i.e the page being replaced).
            `$scripts`:            `<script>` elements from the previous page.
            `$newContainerDiv`:    container element from the new page being loaded.
            `$containerDivParent`: parent of the just removed, previous container
                                   element.
            `nonRepeatedScripts`:  array of `<script>` elements from the new page
                                   to be added to the DOM.
            `existingLinks`:       array of `<link>` elements from the new page
                                   already present in the DOM.
            `exisitngScripts`:     array of `<script>` elements from the new page
                                   already present in the DOM.
            `levelSelector`:       selector string to match container element to be
                                   added to the DOM.
            `stateUrl`:            URL passed to `.saveNewState()` as the `stateUrl
                                   argument.
            `trueUrl`:             URL passed to `.saveNewState()` as the `trueUrl
                                   argument.
            `resolve`:             function to be called on completion of the page load
                                   process. Calling the `resolve` function resolves the
                                   promise returned by `.loadPage()`.
            `promiseTimeoutID`:    Timeout ID of the timer set to call the `reject` 
                                   function of the promise returned by `.loadPage()` on 
                                   expiration. 
        */

        // add the containing element of the new page to the DOM.
        $containerDivParent.append($newContainerDiv);

        // delay a few milliseconds before toggling the transition-controlling
        // classes on the just added elements.

        // This delay is required in order to for the initial styles to take 
        // effect on the loaded elements. 
        // Without a delay, the transition-controlling classes are toggled 
        // immediately and the elements are rendered first with the post-toggle
        // styles, preventing any transitions from occuring.
        setTimeout(() => {
            // get elements with initial page load transition styles.
            let $newTransitionElements = $newContainerDiv.find('.transZero');

            // toggle transition-controlling classes on elements
            $newTransitionElements.each((index, element) => {
                let transitionClass = $(element).data('transition-class');
                $(element).toggleClass(transitionClass);
            });
        }, 10);
        
        // add new `<script>` elements from new page to the DOM.
        nonRepeatedScripts.forEach(element => {
            let $element = $(element);
            let src = $element.attr('src');
            let type = $element.attr('type');

            // create a new `<script>` element for each script to be added
            // to ensure that the entire script runs again.
            let $script = $('<script>')
                .attr('src', src)
                .attr('type', type)                 
                .attr('data-fetchmethod', 'async'); // set `fetchmethod` data attribute to `async`
                                                    // to signify a dynamic script load.
            
            // add new `<script>` element to the DOM.
            $('head').append($script);
            // remove previously fetched `<script>` elements from
            // the associated DOM.
            $element.remove();
        });
        
        // get `<link>` elements in the DOM that are not present in the 
        // new page being loaded.
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
        
        // URLs for scripts which must not be removed from the DOM.
        let requiredUrls = [this.jquerySource];

        // get `<script>` elements in the DOM that are not present in the 
        // new page being loaded.
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
        
        // remove `<link>` and `<script>` elements that are not 
        // required in the new page.
        $(nonRequiredLinks).remove();
        $(nonRequiredScripts).remove();

        // (optionally) create a new browser history entry for the
        // new page being loaded.
        if (setHistory){
            this.saveNewState(levelSelector, stateUrl, trueUrl);
        }
        
        // create element to be used for event-based communication
        // with the window object.
        let $eventGateElement = $('<div>');

        // register handler for `customSendSetHandlersFn:` event on the 
        // event gate element.

        // This event is triggered on the event gate element in response to the
        // `customRequestSetHandlersFn:` event triggered on the global `window` object.
        // The required `SetEventHandlers` function for the new page being loaded
        // is sent as part of the event data.
        $eventGateElement.on('customSendPage:', (e) => {
            let page = e.eventData.page;
            if (page){
                // call `setEventHandlers` function as recieved in the event data.

                // This registers the appropriate event listeners on elements
                // in the new page being loaded.
                page.setEventHandlers();
            }

            // clear timeout previously set to call `reject` on the promise
            // returned by `.loadPage()` on expiration.
            clearTimeout(promiseTimeoutID);

            // resolve the promise returned by `.loadPage()`.
            // This is the final step of the page load process.
            resolve({pageLoadStatus: 'complete'});
        })

        // get fragment name of the page being loaded.
        let fragmentName = $(levelSelector).data('fragment-name');

        // request the `setEventHandlers` function for the new page being loaded
        // (which is identified by its fragment name) by triggering a
        // `customRequestSetHandlersFn:` event on the global window object.
        let requestPageEvent = $.Event('customRequestPage:');
        requestPageEvent.eventData = { 
            fragmentName: fragmentName,
            element: $eventGateElement
        };
        
        $(window).trigger(requestPageEvent);
    }
}


class FixedPage extends Page {
    /*  This type of page is non-scrollable at the time
        of initial page transitions but becomes scrollable
        at a later time, when the initial transitions are
        completed.
    */

    setPageScroll(){
        let $toplevelDiv = $('#toplevel-container');
        let $lowlevelDiv = $('#lowlevel-container');
        
        let intervalID = setInterval(() => {
            let trans = $lowlevelDiv.css('transform');
            if (trans === 'none'){
                $toplevelDiv.removeClass('no-scroll');
                clearTimeout(intervalID);
            }
        }, 100);
    }

    setEventHandlers(){
        super.setEventHandlers();

        this.setPageScroll();
    }
}


export { Page, FixedPage };

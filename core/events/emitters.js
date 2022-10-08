const { EventEmitter } = require('events');


class RouteEmitter extends EventEmitter {
    routerCount = 0;
    listenerQueue = [];

    addListenerToQueue(listener){
        this.listenerQueue.push(listener);
        this.routerCount++;
    }

    addListenerFromQueue(eventName){
        let listener = this.listenerQueue.shift();

        if (listener){
            this.once(eventName, listener);
            return listener;
        }
    }
}

let routeEmitter = new EventEmitter();

let dbEmitter = new EventEmitter();

let middlewareEmitter = new EventEmitter();

module.exports = { routeEmitter, dbEmitter, middlewareEmitter };


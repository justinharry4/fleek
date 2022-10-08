const events = require('./events');
const { routeEmitter, middlewareEmitter } = require('./emitters')
const { makePath } = require("../utils/file");


function getRegisterFeatureRouterOld(featureName, prefix='/'){
    return function (app){
        let routerPath = makePath(featureName + '/routes.js');
        let router = require(routerPath);

        app.use(prefix, router);

        console.log(`${featureName} routes registered.`);

        let listener = routeEmitter.addListenerFromQueue(events.POST_ROUTE_REGISTRATION);

        routeEmitter.emit(events.POST_ROUTE_REGISTRATION, app);

        if (!listener){
            console.log('final route registration');
            routeEmitter.emit(events.POST_FINAL_ROUTE_REGISTRATION, app);
        }
    }
}

function getRegisterFeatureRouter(featureName, prefix){
    return function (app){
        let routerPath = makePath(featureName + '/routes.js');
        let router = require(routerPath);

        if (prefix){
            app.use(prefix, router);
        } else {
            app.use(router);
        }

        // console.log(`${featureName} routes registered.`);

        let listenerCount = this.listenerCount(events.POST_DB_CONNECTION);

        if (listenerCount === 0){
            routeEmitter.emit(events.POST_FINAL_ROUTE_REGISTRATION, app);
        }
    }
}

function getRegisterErrorMiddleware(middleware){
    return function (app){
        app.use(middleware);

        // console.log(`error middleware with ${middleware.length} args registered`);

        let listenerCount = this.listenerCount(events.POST_FINAL_ROUTE_REGISTRATION);

        if (listenerCount === 0){
            middlewareEmitter.emit(
                events.POST_FINAL_ERROR_MIDDLEWARE_REGISTRATION,
                app,
            );
        }
    }
}

function listenForConnections(app){
    const { PORT } = require('../../config/config');

    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}


module.exports = { 
    getRegisterFeatureRouter,
    getRegisterErrorMiddleware,
    listenForConnections,
};




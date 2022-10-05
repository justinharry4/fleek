const { isAsync } = require('./functional');


function makeSafeRegularMiddleware(middlewareFn){
    return (req, res, next) => {
        try {
            middlewareFn(req, res, next);
        } catch(error) {
            console.log('sync catch');
            if (middlewareFn.onError){
                return middlewareFn.onError(error, next);
            }
            next(error);
        }
    }
}

function makeSafeAsyncMiddleware(middlewareFn){
    return async (req, res, next) => {
        try {
            await middlewareFn(req, res, next);
        } catch(error) {
            console.log('async catch')
            if (middlewareFn.onError){
                return middlewareFn.onError(error, next);
            }
            next(error);
        }
    }
}

function makeSafe(middleware){
    let safeMiddleware = {};

    for (let entry of Object.entries(middleware)){
        let [middlewareName, middlewareFn] = entry;

        let safeMiddlewareFn;
        if (isAsync(middlewareFn)){
            safeMiddlewareFn = makeSafeAsyncMiddleware(middlewareFn);
        } else {
            safeMiddlewareFn = makeSafeRegularMiddleware(middlewareFn);
        }

        safeMiddleware[middlewareName] = safeMiddlewareFn;
    }

    return safeMiddleware;
}

module.exports = {
    makeSafe,
}
const events = require('./events/events');
const { middlewareEmitter } = require('./events/emitters');
const { listenForConnections } = require('./events/handlers');
const { makeDatabaseConnection } = require('./db');


module.exports.startServer = async (app) => {
    try {
        makeDatabaseConnection(app);
        
        middlewareEmitter.on(
            events.POST_FINAL_ERROR_MIDDLEWARE_REGISTRATION,
            listenForConnections
        );
    } catch (err) {
        console.log('AN ERROR OCCURED IN STARTSERVER:\n', err);
    }
}



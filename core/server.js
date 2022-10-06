const mongoose = require('mongoose');

const config = require('../config/config');

const CONFIGPORT = config.PORT;
const MONGO_DB_URI = config.MONGO_DB_URI;

const PORT = process.argv[2] || CONFIGPORT;

module.exports.startServer = async (app) => {
    try {
        await mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true });
        console.log('mongoose connected');
        
        app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`);
        });
    } catch (err) {
        console.log('AN ERROR OCCURED IN STARTSERVER:\n', err);
    }
}


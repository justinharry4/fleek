const mongoose = require('mongoose');

const { MONGO_DB_URI, PORT } = require('../config/config');

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


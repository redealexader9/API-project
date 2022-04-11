const mongoose = require('mongoose');

const config = require('./config');
const { MongoMemoryServer } = require('mongodb-memory-server');
//const credentials = {
 //   user: username,
//    pass: password
//};

async function connect(){
    return await mongoose.connect(
        `mongodb://${config.db.host}/${config.db.database}`,
        //credentials
    );
}

module.exports = { connect };
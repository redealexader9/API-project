const mongoose = require('mongoose');
const { beforeAll, afterAll, afterEach } = require('@jest/globals');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');

let mongod = null;
let mongo = null;

async function findById(id) {
    if (typeof id === 'string') {
        id = new ObjectId(id);
    }
    let users = await this.find({ _id: id }).toArray();
    return users[0];
}

async function connect() {
    if (! mongod) {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri('unittest'));
        mongo = new MongoClient(mongod.getUri('unittest'));
        await mongo.connect();
        let db = await mongo.db('unittest');
        module.exports.users = db.collection('users');
        module.exports.users.findById = findById;
        module.exports.courses = db.collection('courses');
        module.exports.courses.findById = findById;
    }
}

async function disconnect() {
    if (mongod) {
        await mongo.close();
        await mongoose.connection.close();
        await mongod.stop();
        mongod = null;
        mongo = null;
    }
}

async function reset() {
    if (mongod) {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
}

beforeAll(connect);
afterAll(disconnect);
afterEach(reset);

module.exports = { connect, disconnect, reset };

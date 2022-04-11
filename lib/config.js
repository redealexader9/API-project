const path = require("path");
module.exports = {

    projectPath(...args) { return path.join(__dirname, '..', ...args) },

    hostPort: 8000,

    logLevel: 'dev',

    sessionOptions: {
    secret: 'bunnyslippers',
    saveUninitialized: false,
    resave: false
    },

db: {
    host: 'localhost',
    database: 'schoolDatabase'
},

};
const http = require('http');
const db = require('./db');
const app = require('./app');
const config = require('./config');
const server = http.createServer(app);
server.listen(config.hostPort, () => {
    console.log(`Listening on port ${config.hostPort}...`);
    db.connect();
});


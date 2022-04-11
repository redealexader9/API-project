
const express = require('express');

const morgan = require('morgan');
const config = require('../config');
const expressSession = require('express-session');
const expressHandlebars = require('express-handlebars');
const api = require('./api');
const sessionFileStore = require('session-file-store');


const app = express();

// Create custom file store class
const FileStore = sessionFileStore(expressSession);

const hbs = expressHandlebars.create({
    defaultLayout: null,
    extname: '.hbs',
});




// Use handlebars for templates with the '.hbs' file extension
app.engine('hbs', expressHandlebars.engine({ defaultLayout: null, extname: '.hbs' }));
//Sets out app to use the handlebars engine

app.set('views', './views');
//app.use(express.static(config.projectPath('static')));




// Logging
app.use(morgan('dev'));

// Request bodies

// Sessions
app.use(expressSession({
    ...config.sessionOptions,
    store: new FileStore()
}));

app.use('/api', api.router);


app.use((err, req, res, next) => {
console.error(err);
res.status(404);
res.send(err);
});

module.exports = app;
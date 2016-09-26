'use strict'

var express = require('express');
var morgan = require('morgan');
var routes = require('./routes/routes.js');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var app = express();
var socketio = require('socket.io')

var models = require('./models/models.js');

app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

app.use(morgan('dev'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', routes(io));
app.use('/static', express.static('public'));

var server = app.listen(3000)
var io = socketio.listen(server)

models.User.sync()
.then(function () {
    return models.Page.sync()
})
.then(function () {
    socketio.listen(server, function () {
        console.log('Server is listening on port 3000!');
    });
})
.catch(console.error);

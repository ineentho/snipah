
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , getlink = require('./routes/getlink')
  , http = require('http')
  , path = require('path')
  , socket = require("./socket");

var app = express();

routes.games = getlink.games

// all environments
app.set('port', process.env.PORT || 8888);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/g/:id', routes.joinGame)
app.get('/users', user.list);
app.get('/getlink/:map', getlink.gen);

var server = http.createServer(app);
var io = require('socket.io').listen(server);
socket.start(io);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
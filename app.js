// -------------- DEPENDANCIES 

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var mysql = require('mysql');

// --------------- ROUTES

var routes = require('./routes/index');
var ajax = require('./routes/ajax');
var projects = require('./routes/projects')

// -------------- APP SETUP
// MYSQL

var connection = mysql.createConnection({ // removed details for github upload
	host : '',
	user : '',
	password : "",
	database : ''
});

connection.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}

	console.log('connected as id ' + connection.threadId);
});

// EXPRESS

var app = express();

// SOCKET IO 

var server = require('http').createServer(app);
server.listen(3001);
var io = require('socket.io')(server);

// JADE SETUP

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

// FAVICON

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// BODY PARSER

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser({
	uploadDir : './uploads'
}));
app.use(bodyParser.urlencoded({
	extended : false
}));

// SESSIONS

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret : 'keyboard cat',
	cookie : {
		maxAge : 60000
	}
}));

// ROUTES

app.use('/', routes);
app.use('/projects', projects);
app.use('/ajax', ajax);

app.use(function(req, res, next) {					// 404 ERROR HANDELING
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// -------------- ERROR HANDELING

if (app.get('env') === 'development') {				// DEVELOPMENT ERROR HANDELING
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {						// PRINT STACKTRACE
			message : err.message,
			error : err
		});
	});
}

app.use(function(err, req, res, next) {				// PRODUCTION ERROR HANDELING
	res.status(err.status || 500);
	res.render('error', {							// NO STACKTRACE
		message : err.message,
		error : {}
	});
});

// -------------- SOCKET IO

var users = {};

io.sockets.on('connection', function(socket) {

	// When the user sends a message
	socket.on('sendchat', function(data) {

		if (data === "")
			return false;

		unix = Math.floor(Date.now() / 1000);
		ufDate = new Date();
		fDate = ufDate.getHours() + ":" + ufDate.getMinutes();

		UploadMessage(data, unix);

		io.sockets.emit('updatechat', socket.username, data, fDate);	// Send message to all connected sockets
	});

	// when the user connects and sends AddUser
	socket.on('adduser', function(username) {
		socket.username = username;
		
		GetID(function(content) {										// Call back function as mysql runs async
			socket.userid = content[0].id;
			socket.avatar = content[0].avatar;

			users[username] = {
				username : username,
				avatar : content[0].avatar
			};
			
			socket.emit('updatechat', 'SERVER', 'you have connected', "");
			socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected', "");
			io.sockets.emit('updateusers', users);
		});

	});

	// On user disconnect, Remove from list and tell other sockets
	socket.on('disconnect', function() {
		delete users[socket.username];
		io.sockets.emit('updateusers', users);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected', "");
	});
	
	// Get the User ID from database of the connected socket
	function GetID(callback) {
		connection.query('SELECT id, avatar FROM users WHERE name = ? LIMIT 1', [socket.username], function(error, results, fields) {
			callback(results);
		});
	};
	
	// When a message is recieved upload it to the database
	function UploadMessage(message, time) {

		var cols = "user_id, message, time";
		var vals = "'" + socket.userid + "','" + message + "','" + time + "'";
		connection.query('INSERT INTO chat_messages (' + cols + ') VALUES (' + vals + ')', function(err, result) {
			console.log(err);
		});
	}

});

module.exports = app;

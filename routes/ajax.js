// -------------- DEPENDANCIES

var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// -------------- MYSQL SETUP

var connection = mysql.createConnection({
	host : 'sql4.freemysqlhosting.net',
	user : 'sql4104756',
	password : "92pbqtRCjr",
	database : 'sql4104756'
});

// -------------- ROUTES

// Project Create task - Creates a new task for a project from post data
router.post('/projectcreatetask', function(req, res, next) {
	var sess = req.session;

	if (!sess.login) {	// Check if client is logged in else stop script
		return false;
	}

	console.log(req.body);
	var cols = "project_id, title, description, state, owner";
	var vals = "'" + req.body['project_id'] + "','" + req.body['title'] + "','" + req.body['description'] + "','" + req.body['state'] + "','" + req.body['owner'] + "'";
	var query = connection.query('INSERT INTO project_tasks (' + cols + ') VALUES (' + vals + ')', function(err, result) {
		console.log(err);
	});

});

// Project Task edit - Edits a task from Post data
router.post('/projecttaskedit', function(req, res, next) {
	var sess = req.session;

	if (!sess.login) {	// Check if client is logged in else stop script
		return false;
	}

	parse = {
		title : req.body['title'],
		description : req.body['description'],
		state : req.body['state']
	}

	var query = connection.query('UPDATE project_tasks SET ? WHERE id = ' + req.body['id'], parse, function(err, result) {
		console.log(err);
	});

});

// Delete project task - Deletes a project's task from post data
router.post('/projecttaskdelete', function(req, res, next) {
	var sess = req.session,
	    tasks = null,
	    currentDelayCount = 0,
	    delayCount = 2;

	if (!sess.login) {	// Check if client is logged in else stop script
		return false;
	}

	function deleteUser(callback) {
		connection.query('DELETE FROM project_tasks WHERE id = ?', req.body['id'], function(err, result) {
			callback(null, result);
		});
	}

	function fetchTasks(callback) {
		connection.query('SELECT id, title, project_id, description, state, owner FROM project_tasks WHERE project_id = ?', req.body['pid'], function(err, result) {
			callback(null, result);
		});
	}

	deleteUser(function(err, content) {
		print();
	});

	fetchTasks(function(err, content) {
		tasks = content;
		print();
	});

	function print() {
		currentDelayCount++;

		if (delayCount === currentDelayCount) {
			res.send(JSON.stringify(tasks));
		}
	}

});

// Porject Create - Creates a project from post data
router.post('/projectcreate', function(req, res, next) {
	var sess = req.session;

	if (!sess.login) {	// Check if client is logged in else stop script
		return false;
	}

	var date = Math.floor(Date.now() / 1000);

	var cols = "name, created, last_edited, edited_by";
	var vals = "'" + req.body['title'] + "','" + date + "','" + date + "','" + sess.login.id + "'";
	var query = connection.query('INSERT INTO projects (' + cols + ') VALUES (' + vals + ')', function(err, result) {
		res.send(JSON.stringify(result.insertId));
	});

});

// Project delete - Deletes a project from post data
router.post('/projectdelete', function(req, res, next) {
	var sess = req.session;

	if (!sess.login) {	// Check if client is logged in else stop script
		return false;
	}

	var query = connection.query('DELETE FROM projects WHERE id = ' + req.body['id'], function(err, result) {
		res.send(JSON.stringify(true));
	});

});

// Get Chat Messages - Get the 10 most recent chat messages to output into chat box on load
router.post('/getchatmessages', function(req, res, next) {

	var messages = {},
	    t = 0;

	function getMessages(callback) {
		connection.query("SELECT chat_messages.id, users.name, chat_messages.message, chat_messages.time FROM chat_messages LEFT JOIN users ON chat_messages.user_id = users.id ORDER BY chat_messages.time ASC LIMIT 10", function(err, result) {
			console.log(err);
			callback(null, result);
		});
	}

	getMessages(function(err, content) {

		var lastDay = new Date().getDate();

		for (var i = 0; i < content.length; i++) {

			ufDate = new Date(content[i].time * 1000);
			fDate = ufDate.getHours() + ":" + ufDate.getMinutes();

			if (lastDay !== ufDate.getDate()) {	// Check if message was past 00:00, if so print date into chat
				input = {
					user : "Server",
					message : ufDate.getDate() + "/" + (ufDate.getMonth() + 1) + "/" + ufDate.getFullYear(),
					time : fDate,
					type : "time"
				}

				messages[t] = input;
				t++;
			}

			lastDay = ufDate.getDate();

			var input = {
				user : content[i].name,
				message : content[i].message,
				time : fDate
			}

			messages[t] = input;
			t++;
		}

		sendMessages();
	});

	// Print json messages object
	function sendMessages() {
		res.send(JSON.stringify(messages));
	}

});

module.exports = router;

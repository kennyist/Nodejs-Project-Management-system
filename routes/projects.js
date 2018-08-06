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

// Porjects home page
router.get('/', function(req, res, next) {
	var sess = req.session,
	    projects = [];

	if (!sess.login) { 								// CHECK IF USER IS LOGGED IN ELSE SEND TO LOGIN PAGE
		res.redirect('/login?r=projects');
		return false;
	}

	function fetchProjects(callback) {
		connection.query('SELECT id, name, created, last_edited, edited_by FROM projects', function(err, result) {
			callback(null, result);
		});
	}

	fetchProjects(function(err, content) {
		projects = content;

		res.render('projects', {
			title : 'Projects',
			login : sess.login,
			projects : projects,
			chatShow : true
		});
	});

});

// Get project page by ID
router.get('/:id', function(req, res, next) {
	var sess = req.session,
	    files = null,
	    tasks = null,
	    currentDelayCount = 0,
	    delayCount = 2;

	if (!sess.login) { 									// CHECK IF USER IS LOGGED IN ELSE SEND TO LOGIN PAGE
		res.redirect('/login?r=projects/' + req.params.id);
		return false;
	}

	function fetchFiles(callback) {
		connection.query('SELECT file_id, name, location FROM project_files WHERE project_id = ?', req.params.id, function(err, result) {
			callback(null, result);
		});
	}

	function fetchTasks(callback) {
		connection.query('SELECT id, title, project_id, description, state, owner FROM project_tasks WHERE project_id = ?', req.params.id, function(err, result) {
			callback(null, result);
		});
	}
	
	fetchTasks(function(err, content) {
		tasks = content;
		pageRender();
	});

	fetchFiles(function(err, content) {
		files = content;
		pageRender();
	});
	
	function pageRender() {
		currentDelayCount++;

		if (delayCount === currentDelayCount) {			// Due to mysql async, delay the fucntion untill both querys have returned

			res.render('project', {
				title : req.params.id,
				login : sess.login,
				chatShow : true,
				files: files,
				tasks: JSON.stringify(tasks),
				projectid : req.params.id
			});
		}

	}

});

// Create project ajax post request
router.post('/create', function(req, res, next) {
	var sess = req.session;

	if (!sess.login) { 									// CHECK IF USER IS LOGGED IN ELSE SEND TO LOGIN PAGE
		res.redirect('/login?r=projects/');
		return false;
	}

	var unix = Math.round(+new Date() / 1000); 			// Generate UNIX timestamp
	var post = {
		name : req.body.title,
		created : unix,
		last_edited : unix,
		edited_by : sess.login
	};

	var query = connection.query('INSERT INTO projects SET ?', post, function(err, result) {
		console.log(err);
	});

	res.redirect('/projects');
	return false;
});

module.exports = router;

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

// Home page
router.get('/', function(req, res, next) {
	var sess = req.session;

	res.render('index', {
		title : 'Express',
		login : sess.login,
		chatShow : false
	});
});

// Login Page
router.get('/login', function(req, res, next) {
	var failed = false;

	if (req.query.c) {
		failed = true;
	}

	connection.query('SELECT * FROM soft352_ci_sessions', function(err, rows) {
		res.render('login', {
			users : rows,
			wrong : failed,
			chatShow : false,
			redirectLink : (req.query.r) ? req.query.r : ""
		});
	});
});

// Login post data page
router.post('/login', function(req, res, next) {

	var username = req.body.username,
	    password = req.body.password,
	    redirect = req.body.redirect,
	    correct = false,
	    sess = req.session,
	    returnedRow = null,
	    redirectF = '/login?c=0',
	    redirectT = '/';

	if (redirect) {
		redirectT += redirect;
	}

	if (password === "" || username === "") {
		res.redirect(redirectF);
		return false;
	}

	connection.query('SELECT id, password, avatar FROM users WHERE name = ? LIMIT 1', [username], function(error, results, fields) {
		if (error) {

		} else if (results) {
			if (!results.length || !results[0].password) {
				res.redirect(redirectF);
				return false;
			}

			if (results[0].password == password) {
				sess.login = {
					'id' : results[0].id,
					'name' : username,
					'avatar' : results[0].avatar
				}
				res.redirect(redirectT);
				return false;
			} else {
				res.redirect(redirectF);
				return false;
			}
		}
	});
});

// Register page
router.get('/register', function(req, res, next) {

	var sess = req.session;

	if (sess.login) {
		res.redirect('/projects/');
		return false;
	}

	var failed = false;

	if (req.query.c) {
		failed = true;
	}

	connection.query('SELECT * FROM soft352_ci_sessions', function(err, rows) {
		res.render('register', {
			chatShow : false
		});
	});
});

// Register post data page
router.post('/register', function(req, res, next) {

	var username = req.body.username,
	    password = req.body.password,
	    redirectF = '/register?c=0';

	if (password === "" || username === "") {
		res.redirect(redirectF);
		return false;
	}

	connection.query("INSERT INTO users (name, password) VALUES ('" + username + "','" + password + "')", function(error) {
		if (error) {
			res.redirect(redirectF);
			console.log(error);
		} else {
			res.redirect('/login');
			return false;
		}
	});
});

module.exports = router;

// TASK CLASS
var Task = function(data, id) {
	this.id = id;
	this.realid = data.id;
	this.title = data.title;
	this.description = data.description;
	this.state = data.state;
	this.owner = data.owner;
	this.projectid = data.project_id;
};

// Task create - upload self to database
Task.prototype.create = function() {

	var data = {
		project_id : this.projectid,
		title : this.title,
		description : this.description,
		state : this.state,
		owner : this.owner
	};

	$.ajax({
		url : '/ajax/projectcreatetask',
		type : 'post',
		data : data,
		success : function(data, textStatus, jqXHR) {
			console.log('sucess');
		},
		error : function(jqXHR, textstatus, errorThrown) {

		}
	});
};

// Task update - Update details to database
Task.prototype.update = function(data) {
	this.title = data[0];
	this.description = data[1];
	this.state = data[2];

	$.ajax({
		url : '/ajax/projecttaskedit',
		type : 'post',
		data : {
			id : this.realid,
			title : this.title,
			description : this.description,
			state : this.state,
			owner : this.owner
		},
		success : function(data, textStatus, jqXHR) {
			return data;
		},
		error : function(jqXHR, textstatus, errorThrown) {
			console.log(errorThrown);
		}
	});
};

// task remove - Delete self from database
Task.prototype.remove = function(outData) {
	$.ajax({
		url : '/ajax/projecttaskdelete',
		type : 'post',
		data : {
			id : this.realid,
			pid : this.projectid
		},
		success : function(data, textStatus, jqXHR) {
			outData(JSON.parse(data));
		},
		error : function(jqXHR, textstatus, errorThrown) {
			console.log(errorThrown);
		}
	});
};

// Task to HTML - Convert self into html output
Task.prototype.toHtml = function() {
	var ret = "<li class='card' id='" + this.id + "'>";
	
	ret += "<div class='card-content'>";
	ret += "<span class='card-title'>"+this.title+"</span>";
	ret += "<p>"+this.description+"</p>";
	ret += "</div>";
	ret += "<div class='card-action'>";
	ret += "<a href='#' data-id='p-edit'>Edit</a>";
	ret += "<a href='#' data-id='p-del'>Delete</a>";
	ret += "</div>";
	ret += "</li>";

	return ret;
};

// ------------------------

$(document).ready(function() {

	if (!$('#project').length) {// Check if project page
		return false;
	}

	// --- Vars

	var current = "#current",
	    backlog = "#backlog",
	    icebox = "#icebox",
	    completed = "#completed",
	    tasksJSON = JSON.parse($('#test').text()),
	    tasks = [],
	    modal = "#edit-modal",
	    modalcreate = "#create-modal",
	    edit_id = 0;

	// --- PREP

	for ( i = 0; i < tasksJSON.length; i++) {// Add all tasks into task array
		tasks.push(new Task(tasksJSON[i], i));
	}

	loadIntoHtml();
	// Load tasks onto page

	// --- Main

	// On edit button click, get id and fill edit form
	$(document).on("click", "a[data-id='p-edit']", function() {
		var id = $(this).parent().parent().attr('id');
		console.log(id);
		edit_id = id;
		fillForm(tasks[id]);
		$(modal).openModal();
		
		return false;
	});

	// On edit form submit, Update details
	$('#edit-modal form').on('submit', function() {
		$(modal).closeModal();

		var data = [];

		data.push($("#edit-modal form input[name='title']").val());
		data.push($("#edit-modal form input[name='description']").val());
		var state = $("#edit-modal form input[type='radio']:checked");
		data.push(state.val());

		tasks[edit_id].update(data);

		loadIntoHtml();

		return false;
	});

	// On delete pressed, get id and delete task
	$(document).on("click", "a[data-id='p-del']", function() {
		var id = $(this).parent().parent().attr('id');

		tasks[id].remove(function(outdata) {
			tasks = [];

			for ( i = 0; i < outdata.length; i++) {
				tasks.push(new Task(outdata[i], i));
				console.log(i);
			}

			loadIntoHtml();
		});
		
		return false;
	});

	// On add task pressed, open create form modal
	$(document).on('click', '#add', function() {
		$(modalcreate).openModal();
	});

	// On create form submit, create new task with details
	$('#create-modal form').on('submit', function() {
		$(modalcreate).closeModal();

		var input = {
			id : 0,
			realid : 0,
			title : $("#create-modal form input[name='ctitle']").val(),
			description : $("#create-modal form input[name='cdescription']").val(),
			state : $("#create-modal form input[type='radio']:checked").val(),
			owner : 1,
			project_id : $("#create-modal form input[name='pid']").val(),
		};

		var task = new Task(input, 50);
		task.create();

		tasks.push(task);

		loadIntoHtml();
		return false;
	});

	// ---- FUNCTIONS

	// Load all tasks into html
	function loadIntoHtml() {

		var html = "",
		    sortedTasks = sort(1, tasks);

		for (var i = 0; i < sortedTasks.length; i++) {
			html += sortedTasks[i].toHtml();
		}

		$(current).html(html);

		html = "",
		sortedTasks = sort(2, tasks);

		for (var i = 0; i < sortedTasks.length; i++) {
			html += sortedTasks[i].toHtml();
		}

		$(backlog).html(html);

		html = "",
		sortedTasks = sort(3, tasks);

		for (var i = 0; i < sortedTasks.length; i++) {
			html += sortedTasks[i].toHtml();
		}

		$(icebox).html(html);

		html = "",
		sortedTasks = sort(4, tasks);

		for (var i = 0; i < sortedTasks.length; i++) {
			html += sortedTasks[i].toHtml();
		}

		$(completed).html(html);
	}

	// Filter tasks by type
	function sort(type, data) {
		var ret = [];

		for (var i = 0; i < data.length; i++) {
			if (data[i].state == type) {
				ret.push(data[i]);
			}
		}

		return ret;
	}

	// Fill edit form
	function fillForm(task) {
		$('#edit-modal input[name="title"]').val(task.title);
		$('#edit-modal input[name="description"]').val(task.description);
		$('#edit-modal input[type="radio"][value="' + task.state + '"]').prop("checked", true);
	};

});

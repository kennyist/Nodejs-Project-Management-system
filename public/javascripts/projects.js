$(document).ready(function() {
	// On creation form submit, upload to database and create new project entry on page
	$('#createProjectForm').on('submit', function() {

		var data = {
			title : $('input[name="title"]').val(),
			description : $('input[name="description"]').val()
		};

		$.ajax({
			url : '/users/projectcreate',
			type : 'post',
			data : data,
			success : function(data, textStatus, jqXHR) {
				var text = '<div class="col s3"><div class="card"><div class="card-image">';

				text += '<span class="card-title">' + 0 + '</span>';
				text += '</div><div class="card-content"><p>' + $('input[name="title"]').val() + "</p></div>";
				text += '<div class="card-action"><a href="/projects/' + data + '">View</a>';
				text += '<a href="#" data-id="' + data + '" data-del>Delete</a></div></div>';

				console.log(text);

				$("#projects .row").append(text);
				Materialize.toast("Project '" + $('input[name="title"]').val() + "' Created", 4000, 'rounded');
			},
			error : function(jqXHR, textstatus, errorThrown) {
				console.log(errorThrown);
			}
		});

		$('#createModal').closeModal();
		return false;
	});
	
	// On project delete pressed, remove from page and from database
	$(document).on('click', '#projects a[data-del]', function() {
		var id = $(this).attr('data-id'),
		    element = $(this).parent().parent().parent();

		$.ajax({
			url : '/users/projectdelete',
			type : 'post',
			data : {
				id : id
			},
			success : function(data, textStatus, jqXHR) {
				console.log("deleted");
				$(element).hide();
				Materialize.toast("Project Deleted", 4000, 'rounded');
			},
			error : function(jqXHR, textstatus, errorThrown) {
				alert("Failed to delete project");
			}
		});

		return false;
	});
});


// Message class
var Message = function(data, id) {
	this.message = data.message;
	this.realid = data.id;
	this.id = id;
};

//

$(document).ready(function() {
	
	// --- Vars 

	var socket = io.connect('http://localhost:3001'), 	// Connect to socket IO
		openClose = true,
	    messages = [],
	    messageSound = document.createElement('audio'),	// New message sound
	    missedMessages = 0;
	    
	// --- Prep

	messageSound.setAttribute('src', "http://www.oringz.com/oringz-uploads/sounds-1001-buzzy.mp3"); // add sound to sound element
	
	GetMessages(function(c) {			// Get the last 10 messages and print them into the chat
		var data = JSON.parse(c);

		$.each(data, function(key, value) {

			if (value.type === "time") {
				$('#chatbox').append('<li class="chat-message"><p><span class="chat-time">' + value.message + '</span></p></li>');
			} else {

				$('#chatbox').append('<li class="chat-message"><p><span class="chat-time">' + value.time + '</span> <span class="chat-name">' + value.user + ':</span></p><p>' + value.message + '</p></li>');
			}
		});

		$('#chatbox').scrollTop(1000);
	});
	
	// --- Main

	// Toggle the chat open or closed on button click
	$('#chat-toggle').click(function() {

		if (openClose) {
			$('#chat').animate({
				width : "400px",
			}, 200);
			missedMessages = 0;
			$('#chat-toggle p').text('Chat');
		} else {
			$('#chat').animate({
				width : "0px",
			}, 200);
		}

		openClose = !openClose;
	});

	// On connect send user data
	socket.on('connect', function() {
		socket.emit('adduser', $('#chat').attr('data-name'));
	});

	// One message received print in to the chat box
	socket.on('updatechat', function(username, data, time) {
		$('#chatbox').append('<li class="chat-message"><p><span class="chat-time">' + time + '</span> <span class="chat-name">' + username + ':</span></p><p>' + data + '</p></li>');
		$('#chatbox').scrollTop(1000);

		if (openClose) {	// If chat is closed, play noise and show missed message count
			messageSound.play();
			missedMessages++;
			$('#chat-toggle p').text('Chat [' + missedMessages + ']');
		}
	});
	
	// On update users received empty user box and refill with recieved data
	socket.on('updateusers', function(data) {
		$('#users').empty();

		$.each(data, function(key, value) {
			$('#users').append('<li><img src="' + value.avatar + '"> <span class="chat-users-name">' + key + '</span></li>');
		});
	});
	
	
	// Send chat message
	$('#chatTextBoxSend').click(function() {
		var message = $('#chatTextBox').val();
		$('#chatTextBox').val('');
		
		socket.emit('sendchat', message);
	});

	// when the user presses ENTER send chat message
	$('#chatTextBox').keypress(function(e) {
		if (e.which == 13) {
			$(this).blur();
			$('#chatTextBoxSend').focus().click();
		}
	});
	
	// Get the 10 most recent chat messages
	function GetMessages(callback) {

		$.ajax({
			url : '/ajax/getchatmessages',
			type : 'post',
			success : function(data, textStatus, jqXHR) {
				callback(data);
			},
			error : function(jqXHR, textstatus, errorThrown) {
				callback(errorThrown);
			}
		});

	}

});

// On user disconect close socket connection
$(window).on('beforeunload', function() {
	socket.close();
});

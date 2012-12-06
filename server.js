var app = require('http').createServer(handler)
	, io = require('socket.io').listen(app)
	, staticReq = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new staticReq.Server('./');
	
// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it
app.listen(8080);

// If the URL of the socket server is opened in a browser
function handler(request, response) {request.addListener('end', function () {fileServer.serve(request, response);}); }
//function handler(request, response) {response.writeHeader(200, {'Content-Type': 'text/plain'});  response.end('Hello World\n');}

// Delete this row if you want to see debug messages
io.set('log level', 1);

var PLAYER_ID = 0;
var player_list = {};
// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
	PLAYER_ID++;

	player_list[socket.id] = {"player_id":PLAYER_ID,x:0,y:0,angle:0};
	// Start listening for mouse move events
	/*
	socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});*/
	
	socket.on('ping', function(data) { console.log("pinged; interval:" + data + " player id: " + player_list[socket.id].player_id); socket.emit("pong",PLAYER_ID);});
	socket.on('player_position', function(data) {
		player_list[socket.id].x = data.x;
		player_list[socket.id].y = data.y;
		socket.broadcast.emit('player_position',data);
	});
	socket.on('disconnect', function(){
		console.log("player " + player_list[socket.id].player_id + " disconnected");
		socket.broadcast.emit('player_removed', PLAYER_ID);
		delete player_list[socket.id];
	});
});

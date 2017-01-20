var rpc = require('datastore-rpc')();
var io = require('socket.io-client');

rpc.router.use('/path', function(request, respond, next) {
	console.log("Router 1 request");
	respond("error", "response");
	respond("error2", "response2");
});

rpc.once('connect', function() {
	rpc.request('dsnyc1', '/api/ping', {key: "val"}, {multipleResponses: false}, function(error, response) {
		console.log("RESPONSE", error, response);
	});

});

var socket = io('http://localhost:8005');

rpc.addConnection(socket);


/*
var router = require('../lib/NodeRouter')({});

router.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});

router.on('address', function(address) {
	console.log("Address set", address);
	router.send('dsnyc1', "MYMESSAGE22");
});



/*
socket.on('connect', function(){

});
*/



/*
socket.on('data', function(data){
	console.log("Received data", data, typeof data.key);
});
socket.on('disconnect', function(){});
*/
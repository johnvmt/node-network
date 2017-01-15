var io = require('socket.io-client');

var router = require('../lib/NodeRouter')({});

router.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});

router.on('address', function(address) {
	console.log("Address set", address);
	router.send('dsnyc1', "MYMESSAGE22");
});

var socket = io('http://localhost:8000');

router.addConnection(socket);

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
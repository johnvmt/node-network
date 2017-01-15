var router = require('../lib/NodeRouter')({address: 'dsnyc1'});

router.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});

router.on('address', function(address) {
	console.log("Address set", address);
});

var io = require('socket.io')();
io.on('connection', function(client){

	console.log("CLIENT");

	router.addConnection(client);


	/* client.on('data', function(data){
		console.log("Received data", data);
	});

	/*
	client.on('disconnect', function(){
		console.log("DISCONNECT");
	});
	*/

});

io.listen(8000);
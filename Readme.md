# node-network #
Link webpages and/or Node.js-based applications using any sort of two-way connection (eg: socket.io)

Creates a network of nodes, with addresses, allowing any node to send a message to any other connected node.

## Usage ##

(From Test)

	var NodeRouter = require('node-network');
	var VirtualLink = require('node-network/test/links/VirtualLink');
	
	var router1 = NodeRouter({address: 'router1'});
	var router2 = NodeRouter(); // Will be assigned address router1-1

	// Link Router 1 and Router 2
	var link_1_2 = VirtualLink();

	router1.addConnection(link_1_2.connection1);
	router2.addConnection(link_1_2.connection2);

	link_1_2.connection1.connect();
	link_1_2.connection2.connect();

	var message = 'teststring';

	router2.on('message', function(messageGram) {
		if(messageGram == message)
			done();
		else
			throw new Error("Message doesn't match");
	});

	router1.on('insert', function(insertOp) {
		if(insertOp.address == 'router1-1') // Router 1 linked to Router 2
			router1.send('router1-1', message);
	});
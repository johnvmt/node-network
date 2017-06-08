var assert = require('assert');

var NodeRouter = require('../');
var VirtualLink = require('./links/VirtualLink');


describe('NodeRouter using VirtualLink', function() {
	describe('2-Node Network', function() {
		it('Send string from Node 1 to Node 2', function(done) {
			var router1 = NodeRouter({address: 'router1'});
			var router2 = NodeRouter(); // Will be assigned address router1-1

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
		});

		it('Send string from Node 2 to Node 1', function(done) {
			var router1 = NodeRouter({address: 'router1'});
			var router2 = NodeRouter(); // Will be assigned address router1-1

			var link_1_2 = VirtualLink();

			router1.addConnection(link_1_2.connection1);
			router2.addConnection(link_1_2.connection2);

			link_1_2.connection1.connect();
			link_1_2.connection2.connect();

			var message = 'teststring';

			router1.on('message', function(messageGram) {
				if(messageGram == message)
					done();
				else
					throw new Error("Message doesn't match");
			});

			router2.on('insert', function(insertOp) {
				if(insertOp.address == 'router1') // Router 1 linked to Router 2
					router2.send('router1', message);
			});
		});
	});

	describe('3-Node Network', function() {
		it('Send string from Node 1 to Node 3', function(done) {
			var router1 = NodeRouter({address: 'router1'});
			var router2 = NodeRouter(); // Will be assigned address router1-1
			var router3 = NodeRouter(); // Will be assigned address router1-1-1

			// Link Router 1 and Router 2
			var link_1_2 = VirtualLink();

			router1.addConnection(link_1_2.connection1);
			router2.addConnection(link_1_2.connection2);

			link_1_2.connection1.connect();
			link_1_2.connection2.connect();

			// Link Router 2 and Router 3
			var link_2_3 = VirtualLink();

			router2.addConnection(link_2_3.connection1);
			router3.addConnection(link_2_3.connection2);

			link_2_3.connection1.connect();
			link_2_3.connection2.connect();

			var message = 'teststring';

			router3.on('message', function(messageGram) {
				if(messageGram == message)
					done();
				else
					throw new Error("Message doesn't match");
			});

			router3.on('address', function(address) {
				router1.send(address, message);
			});
		});

	});

});
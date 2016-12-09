var Rpc = require('agnostic-rpc');
var EventEmitter = require('wolfy87-eventemitter');
var RouteTable = require('./RouteTable');
var AddressManager = require('./AddressManager');
var Utils = require('./Utils');

/*
Do not advertise children; just advertise self

AAAA (advertise AAAA*)
AAAA-1111, connected to BBBB-1111 (advertise AAAA-1111(0), AAAA(1))
BBBB

Advertise self with cost 0, do not advertise subnets of self
Only advertise on changes, when changes involve min cost through this router changing (or route disappearing)

What happens when we have BBBB/3 and BBBB-1/4?
Calculate if we have shorter path to prent of av

*/

function NodeRouter(config) {
	if(typeof config != 'object')
		config = {};

	var router = this;

	router.config = config;

	router._routeTable = RouteTable();
	router._connections = [];
	router._rpc = Rpc();
	router._setAddress(this.config.address); // will set even if address is undefined

	router._actions = {
		route: function(packet, connection, callback) {
			router._route(packet, callback);
		},
		addressreassign: function(query, connection, callback) {
			if(query.prevAddress == router.address)
				router._setAddress(query.address);
		},
		addressrequest: function(query, connection, callback) {

			var allocate = router._addressManager.allocate();
			//console.log("ADDR-REQ at", router.address, "ALLOCATING", allocate);
			callback(null, allocate);
		},
		routesupdate: function(routeOperations, connection) {
			if(Array.isArray(routeOperations.insert)) {
				// Remove own address
				routeOperations.insert = routeOperations.insert.filter(function(insertOp) {
					return insertOp.address != router.address;
				});

				// TODO set time-based costs for each connection
				// Add costs from this router
				routeOperations.insert.forEach(function(insertOp, index) {
					insertOp.cost = insertOp.cost + 1;
				});
			}

			var localOperations = router._routeTable.modifyRoutes(routeOperations, connection);

			if(Object.keys(localOperations).length) {
				router._connections.forEach(function(connection) {
					// TODO filter for each connection
					router.rpcRequest(connection, 'routesupdate', localOperations);
				});
			}
		}
	};
}

NodeRouter.prototype.__proto__ = EventEmitter.prototype;

NodeRouter.prototype._setAddress = function(address) {
	var router = this;

	// TODO reallocate addresses with address manager?

	if(typeof router.address == 'string') { // Address was previously set
		var childRoutes = router._routeTable.childRoutes(this.address);
		console.log("CROUTES", childRoutes);
		// disconnect from trie
		// for each connection, reassign
	}

	router.address = address;

	router._addressManager = AddressManager({
		baseAddress: router.address
	});

	router._connections.forEach(function(connection) {
		// TODO filter for each connection
		var addressOps = {insert: [{address: router.address, cost: 0}]};
		router.rpcRequest(connection, 'routesupdate', addressOps);
	});
};

NodeRouter.prototype.addConnection = function(connection) {
	var router = this;

	this._connections.push(connection);

	connection.on('data', function(data) {
		try {
			router.rpcMessage(connection, data);
		}
		catch(error) {
			console.log(error);
		}
	});

	connection.connect(function() {

		// Send routing table
		// TODO move to own function
		// TODO behavior when address not set?
		if(typeof router.address == 'string') {
			var routerTableOps = router._routeTable.toRouteOperations(function(nodeData, routePath) {
				// TODO move to is-child-of function in routetable
				return !(routePath.length > router.address.length && routePath.indexOf(router.address) == 0 && routePath[router.address.length] == '-');
			});

			// Add own address
			if (!Array.isArray(routerTableOps.insert))
				routerTableOps.insert = [];
			routerTableOps.insert.push({address: router.address, cost: 0});

			router.rpcRequest(connection, 'routesupdate', routerTableOps);
		}
		else {
			router.rpcRequest(connection, 'addressrequest', function (error, response) {
				if(error)
					console.error("ADDREQ-FAILED", error);
				else
					router._setAddress(response);
			});
		}
	});
};

NodeRouter.prototype._filterOperations = function(operations, connection) {


};

NodeRouter.prototype.rpcRequest = function() {
	var parsedArgs = Utils.parseArgs(
		arguments,
		[
			{name: 'connection', level: 0,  validate: function(arg, allArgs) { return typeof arg == 'object'; }},
			{name: 'action', level: 0,  validate: function(arg, allArgs) { return typeof arg == 'string'; }},
			{name: 'query', level: 1,  validate: function(arg, allArgs) { return typeof arg == 'object'; }, default: {}},
			{name: 'callback', level: 1,  validate: function(arg, allArgs) { return typeof(arg) === 'function'; }}
		]
	);

	var requestMessage = this._rpc.request({
		action: parsedArgs.action,
		query: parsedArgs.query
	}, function(error, response) {
		if(typeof parsedArgs.callback == 'function') {
			if(error)
				parsedArgs.callback(error, null);
			else if(typeof response.status == 'string' && response.status == 'ok')
				parsedArgs.callback(null, response.response);
			else if(typeof response.status == 'string')
				parsedArgs.callback(response.error, response.response);
		}
	});

	parsedArgs.connection.emit(requestMessage);
};

NodeRouter.prototype.send = function(destAddress, message, options, callback) {
	// TODO add options and callback handling
	this._route({
		message: message,
		dest: destAddress
	});
};

NodeRouter.prototype._route = function(packet, callback) {
	// TODO add callback handling
	if(packet.dest == this.address) {
		this.emit('data', packet);
		this.emit('message', packet.message);
	}
	else {
		console.log("MSG TRANSITING", this.address, packet.message);
		var nextHopNode = this._routeTable.nextHop(packet.dest);
		if(nextHopNode) {
			this.rpcRequest(nextHopNode.data.connection, 'route', packet);
		}
		// TODO add error handling
	}
};

NodeRouter.prototype.rpcMessage = function(connection, message) {
	if(this._rpc.messageIsResponse(message)) // response
		this._rpc.handleResponse(message);

	else { // request

		var actions = this._actions;

		this._rpc.handleRequest(message,
			function(request, respond) {

				var packResponse = function(error, response) {
					if(error) {
						respond({
							status: 'error',
							error: error,
							response: response
						});
					}
					else {
						respond({
							status: 'ok',
							response: response
						});
					}
				};

				if(typeof request.action == 'string' && typeof actions[request.action] == 'function')
					actions[request.action](request.query, connection, packResponse);
				else
					packResponse('action_not_found', null);

			},
			function(responseMessage) {
				connection.emit(responseMessage);
			}
		);
	}
};

module.exports = function(config) {
	return new NodeRouter(config)
};
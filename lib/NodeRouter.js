var Rpc = require('agnostic-rpc');
var EventEmitter = require('wolfy87-eventemitter');
var RouteTable = require('./RouteTable');
var AddressManager = require('./AddressManager');
var Utils = require('./Utils');

function NodeRouter(config) {
	if(typeof config != 'object')
		config = {};

	var router = this;

	router.config = config;

	router._routeTable = RouteTable();
	router._connections = [];
	router._rpc = Rpc();
	router.setAddress(this.config.address); // will set even if address is undefined

	router._actions = {
		ping: function(query, connection, callback) {
			callback(null, true);
		},
		route: function(packet, connection, callback) {
			router._route(packet, callback);
		},
		addressrevoke: function(address, connection, callback) {
			if(typeof router._addressManager != 'undefined' && router._addressManager.addressIsEqual(address)) // address to unset is our address
				router._setAddressParts();
		},
		addressrequest: function(query, connection, callback) {
			// TODO REMOVE console.log("ADDRREQ", router.config._id);
			if(typeof router._addressManager == 'object') {
				var childAddress = router._addressManager.allocate();
				callback(null, childAddress);
			}
			else
				callback('no_address', null);
		},
		routesupdate: function(routeOperations, connection) {

			// console.log(router.config._id, JSON.stringify(routeOperations));
			// TODO cleanup
			// Check if we have address set
			// If not, and if routeOperations.insert contains a path with 0 cost, request an address

			if(typeof router.address == 'undefined') {
				if(Array.isArray(routeOperations.insert)) {
					var routesCostZero = routeOperations.insert.filter(function(route) {
						return route.cost == 0;
					});
					if(routesCostZero.length > 0) { // advertising a route with 0 cost (itself)
						router.rpcRequest(connection, 'addressrequest', function (error, response) {
							if(error)
								console.error("ADDREQ-FAILED", error);
							else
								router._setAddressParts(response);
						});
					}
				}
			}

			router._routesApplyOperations(routeOperations, connection);
		}
	};
}

NodeRouter.prototype.__proto__ = EventEmitter.prototype;

/**
 *
 * @param destAddressJoined
 * @param message
 * @param options
 * @param callback
 */
NodeRouter.prototype.send = function(destAddressJoined, message, options, callback) {
	var destAddress = destAddressJoined.split('-');

	// TODO add options and callback handling
	this._route({
		message: message,
		dest: destAddress
	});
};

/**
 *
 * @param addressJoined
 * @returns {boolean}
 */
NodeRouter.prototype.setAddress = function(addressJoined) {
	if(typeof addressJoined == 'string') { // valid address
		var addressParts = addressJoined.split('-');
		return this._setAddressParts(addressParts);
	}
	else
		return false;
};

NodeRouter.prototype._broadcastRouteOperations = function(routeOperations) {
	var router = this;
	// TODO REMOVE console.log("CONNECTIONS", router._connections.length);
	router._connections.forEach(function(connection) {
		// TODO REMOVE console.log("ROPS-BCAST", router.config._id, router.address, JSON.stringify(routeOperations));
		// TODO filter for each connection
		// TODO remove parse/stringify
		// console.log("HIT");
		router.rpcRequest(connection, 'routesupdate', JSON.parse(JSON.stringify(routeOperations)));
	});
};

NodeRouter.prototype._routesApplyOperations = function(routeOperations, connection) {
	var router = this;
	if(Array.isArray(routeOperations.insert)) {
		// Remove own address
		if(typeof router.address != 'undefined') {
			routeOperations.insert = routeOperations.insert.filter(function (insertOp) {
				return !router._addressManager.addressIsEqual(insertOp.address);
			});
		}

		// Add costs from this router
		routeOperations.insert.forEach(function(insertOp, index) {
			insertOp.cost = insertOp.cost + 1;
		});
	}

	// TODO-remove console.log("ROPS-INS", router.config._id, JSON.stringify(routeOperations));

	var localOperations = router._routeTable.modifyRoutes(routeOperations, connection);

	var insertFilter = function(routeOperation) {
		if(typeof router._addressManager == 'undefined') // no address for local router
			return false;

		return !router._addressManager.addressIsChild(routeOperation.address); // only include if route is not child of router
	};

	// Remove children
	localOperationsBroadcast = router._routeOperationsFilter(localOperations, {
		insert: insertFilter
	});

	if(Object.keys(localOperationsBroadcast).length) {
		// TODO REMOVE console.log("LOPS", router.config._id, JSON.stringify(localOperationsBroadcast));
		router._broadcastRouteOperations(localOperationsBroadcast);
	}
};

NodeRouter.prototype._setAddressParts = function(address) {
	var router = this;
	var routerOperations = {};

	// Address was previously set
	// Revoke addresses of children
	if(typeof router.address != 'undefined') {
		routerOperations.remove = [router.address]; // TODO needs clone on array?

		var childRoutes = router._routeTable.childRoutes(this.address);

		if(typeof childRoutes == 'object') {
			Utils.objectForEach(childRoutes, function(routeNode, routeKey) {
				// Delete from table (no need to broadcast removal because we don't advertise children)
				// TODO cleanup so that we don't need to use concat
				var childAddress = router.address.concat(routeKey);
				router._routeTable.removeRoute(childAddress, routeNode.connection);

				router.rpcRequest(routeNode.connection, 'addressrevoke', childAddress); // revoke addresses from children
			});
		}
	}

	router.address = address;
	router._addressManager = undefined; // unset the address manager

	if(typeof router.address != 'undefined') {
		router._addressManager = AddressManager({
			baseAddress: router.address
		});
		routerOperations.insert = [{address: router.address, cost: 0}];
	}

	router.emit('addressParts', router.address);

	var addressJoined = Array.isArray(this.address) ? router.address.join('-') : undefined;
	router.emit('address', addressJoined);

	if(Object.keys(routerOperations).length) {
		// TODO REMOVE console.log("SETADDR", router.config._id, router.address, JSON.stringify(routerOperations));
		router._broadcastRouteOperations(routerOperations);
	}
};

/**
 * Turn the routing table into a series of operations for immediate connections
 * Adds its own address as well
 * @param filter
 */
NodeRouter.prototype.connectionRouteTableOperations = function(connection) {
	var router = this;
	var filter = function(nodeData, routePath) {
		// Filter function
		if(nodeData.connection == connection) // Don't include routes whose first stop is through the connection
			return false;

		if(typeof router._addressManager == 'object' && router._addressManager.addressIsChild(routePath)) // own address is set, and path is a child of path
			return false;

		return true;
	};

	var routerTableOps = router._routeTable.toRouteOperations(filter);

	if(typeof router.address != 'undefined') { // Own address is set, add it
		if (!Array.isArray(routerTableOps.insert)) // create insert ops, if they don't exist
			routerTableOps.insert = [];
		routerTableOps.insert.push({address: router.address, cost: 0});
	}

	//console.log("RTOPS", JSON.stringify(routerTableOps));

	return routerTableOps;

};

/**
 * Add a connection between routers
 * @param connection
 */
NodeRouter.prototype.addConnection = function(connection) {
	var router = this;

	this._connections.push(connection);
	// TODO remove console.log("CONN-ADD", this.config._id, this._connections.length);

	connection.on('data', function(data) {
		try {
			router.rpcMessage(connection, data);
		}
		catch(error) {
			console.error(error);
		}
	});

	connection.on('disconnect', function() {
		console.error("DISCONNECTED");
		// TODO add disconnection behavior
	});

	connection.on('connect', sendRoutingTable);

	sendRoutingTable();

	function sendRoutingTable() {
		var routingTableOperations = router.connectionRouteTableOperations(connection);
		router.rpcRequest(connection, 'routesupdate', routingTableOperations);
	}
};

/**
 * TODO add to route updates
 * @param routeOperations
 * @param filters
 * @returns {{}}
 * @private
 */
NodeRouter.prototype._routeOperationsFilter = function(routeOperations, filters) {

	// TODO-REMOVE console.log("ROPS-FILTER", routeOperations);

	var routeOperationsFiltered = {};

	Utils.objectForEach(routeOperations, function(routeOperationsAction, routeOperationsActionKey) {
		if(Array.isArray(routeOperationsAction)) {
			if(typeof filters[routeOperationsActionKey] == 'function') { // filter exists
				var filtered = routeOperationsAction.filter(filters[routeOperationsActionKey]); // apply the filter
				if(Array.isArray(filtered)) // check if result array has any elements
					routeOperationsFiltered[routeOperationsActionKey] = filtered;
			}
			else // no filter, add all
				routeOperationsFiltered[routeOperationsActionKey] = routeOperationsAction;
		}
	});

	return routeOperationsFiltered;
};

/**
 * Send an RPC request to all connections
 * TODO add parameters to JSDOC
 */
NodeRouter.prototype.rpcBroadcast = function() {
	var router = this;
	var argsPassed = Array.prototype.slice.call(arguments);
	router._connections.forEach(function(connection) {
		router.rpcRequest.apply(router, [connection].concat(argsPassed)); // add connection as first arg
	});
};

/**
 * Send an RPC request over a single connection
 * TODO add parameters to JSDOC
 */
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

	parsedArgs.connection.emit('data', requestMessage);
};

/**
 * Route a packet. Packet
 * @param packet
 * @param callback
 * @private
 */
NodeRouter.prototype._route = function(packet, callback) {
	// TODO add callback handling
	if(typeof this._addressManager == 'object' && this._addressManager.addressIsEqual(packet.dest)) {
		// this is destination
		this.emit('data', packet);
		this.emit('message', packet.message);
	}
	else {
		var nextConnection = this._routeTable.nextConnection(packet.dest);

		if(typeof nextConnection != 'undefined')
			this.rpcRequest(nextConnection, 'route', packet);
		else
			console.error("COULD NOT ROUTE");
		// TODO add error handling
	}
};

/**
 * Handle an RPC message (request or response to a request)
 * @param connection
 * @param message
 */
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
				// TODO add a single connection.emit handler
				connection.emit('data', responseMessage);
			}
		);
	}
};

module.exports = function(config) {
	return new NodeRouter(config)
};
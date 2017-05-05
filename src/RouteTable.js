var Utils = require('./Utils');
var Tree = require('./Trie');
var EventEmitter = require('wolfy87-eventemitter');

function RouteTable(config) {
	this.table = Tree();
}

/**
 * Convert route table to operations to pass to another router
 * @param [filter]
 * @returns {*}
 */
RouteTable.prototype.toRouteOperations = function(filter) {
	var routeOperationsInsert = [];
	this.table.traverse(function(nodeData, routeKeys) {
		if(typeof filter != 'function' || filter(nodeData, routeKeys))
			routeOperationsInsert.push({address: routeKeys, cost: nodeData.cost});
	});

	return routeOperationsInsert.length == 0 ? {} : {insert: routeOperationsInsert};
};

RouteTable.prototype.__proto__ = EventEmitter.prototype;

/**
 * Get immediate children of parent
 * @param parentAddress
 * @returns {*|XMLList}
 */
RouteTable.prototype.childRoutes = function(parentAddress) {
	return this.table.children(parentAddress);
};

/**
 * Return the connection key for the most precise route (longest prefix) to the destination
 * @param destAddress
 * @returns {*}
 */
RouteTable.prototype.nextConnection = function(destAddress) {
	var closestRoute = this.table.deepest(destAddress);
	if(typeof closestRoute == 'object')
		return closestRoute.data.connectionKey;
	else
		return undefined;
};

/**
 * Remove all routes that use the specified connection
 * @param connectionKey
 */
RouteTable.prototype.removeConnectionRoutes = function(connectionKey) {
	var removeRoutes = [];
	this.table.traverse(function(nodeData, routeKeys) {
		if(nodeData.connectionKey == connectionKey)
			removeRoutes.push(routeKeys);
	});

	return this.modifyRoutes({remove: removeRoutes}, connectionKey);
};

/**
 *
 * @param routeOperations
 * @param connectionKey
 * @returns {{}}
 */
RouteTable.prototype.modifyRoutes = function(routeOperations, connectionKey) {
	var routeTable = this;
	var operationsCompleted = {};

	// TODO REMOVE console.log("ROPS-MOD", JSON.stringify(routeOperations));

	if(Array.isArray(routeOperations.remove)) {
		routeOperations.remove.forEach(function(destAddress) {
			if(Array.isArray(destAddress) && routeTable.removeRoute(destAddress, connectionKey)) {
				if(!Array.isArray(operationsCompleted.remove))
					operationsCompleted.remove = [];
				if(operationsCompleted.remove.indexOf(destAddress) < 0)
					operationsCompleted.remove.push(destAddress);
				routeTable.emit('remove', destAddress);
			}
		});
	}

	if(Array.isArray(routeOperations.insert)) {
		routeOperations.insert.forEach(function(insertRoute) {
			if(Array.isArray(insertRoute.address) && typeof insertRoute.cost == 'number' && routeTable.insertRoute(insertRoute.address, connectionKey, insertRoute.cost)) {
				if(!Array.isArray(operationsCompleted.insert))
					operationsCompleted.insert = [];
				if(operationsCompleted.insert.indexOf(insertRoute) < 0)
					operationsCompleted.insert.push(insertRoute);
				routeTable.emit('insert', insertRoute);
			}
		});
	}

	return operationsCompleted;
};

/**
 * Add a route, returns true on success (new route is lowest cost route and did not already exist), false on failure
 * @param destAddress
 * @param connectionKey
 * @param cost
 * @returns {boolean}
 */
RouteTable.prototype.insertRoute = function(destAddress, connectionKey, cost) {
	var route = this.table.get(destAddress);

	// Insert if no route exists, existing cost is higher or connection of existing is the same as new
	if(typeof route == 'undefined' || route.cost > cost || route.connectionKey == connectionKey) {
		this.table.set(destAddress, {cost: cost, connectionKey: connectionKey});
		return true;
	}
	return false;
};

/**
 * Remove a route
 * @param destAddress
 * @param connectionKey
 * @returns {boolean}
 */
RouteTable.prototype.removeRoute = function(destAddress, connectionKey) {
	var route = this.table.get(destAddress);

	// Remove if node's connection matches (router no longer has route)
	if(typeof route == 'object' && route.connectionKey == connectionKey)
		return this.table.remove(destAddress);
	else
		return false;
};

module.exports = function(config) {
	return new RouteTable(config);
};
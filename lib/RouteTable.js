var Utils = require('./Utils');
var Tree = require('./Trie');

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

/**
 * Get immediate children of parent
 * @param parentAddress
 * @returns {*|XMLList}
 */
RouteTable.prototype.childRoutes = function(parentAddress) {
	return this.table.children(parentAddress);
};

/**
 * Return the connection for the most precise route (longest prefix) to the destination
 * @param destAddress
 * @returns {*}
 */
RouteTable.prototype.nextConnection = function(destAddress) {
	var closestRoute = this.table.deepest(destAddress);
	if(typeof closestRoute == 'object')
		return closestRoute.data.connection;
	else
		return undefined;
};

/**
 * Remove all routes that use the specified connection
 * @param connection
 */
RouteTable.prototype.removeConnectionRoutes = function(connection) {
	var removeRoutes = [];
	this.table.traverseNodesData(function(nodeData, routeKeys) {
		if(nodeData.connection == connection)
			removeRoutes.push(routeKeys);
	});

	return this.modifyRoutes({remove: removeRoutes}, connection);
};

/**
 *
 * @param routeOperations
 * @param connection
 * @returns {{}}
 */
RouteTable.prototype.modifyRoutes = function(routeOperations, connection) {
	var routeTable = this;
	var operationsCompleted = {};

	// TODO REMOVE console.log("ROPS-MOD", JSON.stringify(routeOperations));

	if(Array.isArray(routeOperations.remove)) {
		routeOperations.remove.forEach(function(destAddress) {
			if(Array.isArray(destAddress) && routeTable.removeRoute(destAddress, connection)) {
				if(!Array.isArray(operationsCompleted.remove))
					operationsCompleted.remove = [];
				if(operationsCompleted.remove.indexOf(destAddress) < 0)
					operationsCompleted.remove.push(destAddress);
			}
		});
	}

	if(Array.isArray(routeOperations.insert)) {
		routeOperations.insert.forEach(function(insertRoute) {
			if(Array.isArray(insertRoute.address) && typeof insertRoute.cost == 'number' && routeTable.insertRoute(insertRoute.address, connection, insertRoute.cost)) {
				if(!Array.isArray(operationsCompleted.insert))
					operationsCompleted.insert = [];
				if(operationsCompleted.insert.indexOf(insertRoute) < 0)
					operationsCompleted.insert.push(insertRoute);
			}
		});
	}

	return operationsCompleted;
};

/**
 * Add a route, returns true on success (new route is lowest cost route and did not already exist), false on failure
 * @param destAddress
 * @param connection
 * @param cost
 * @returns {boolean}
 */
RouteTable.prototype.insertRoute = function(destAddress, connection, cost) {
	var route = this.table.get(destAddress);

	// Insert if no route exists, existing cost is higher or connection of existing is the same as new
	if(typeof route == 'undefined' || route.cost > cost || route.connection == connection) {
		this.table.set(destAddress, {cost: cost, connection: connection});
		return true;
	}
	return false;
};

/**
 * Remove a route
 * @param destAddress
 * @param connection
 * @returns {boolean}
 */
RouteTable.prototype.removeRoute = function(destAddress, connection) {
	var route = this.table.get(destAddress);

	// Remove if node's connection matches (router no longer has route)
	if(typeof route == 'object' && route.connection == connection)
		return this.table.remove(destAddress);
	else
		return false;
};

module.exports = function(config) {
	return new RouteTable(config);
};
var Utils = require('./Utils');
var Tree = require('./Trie');

function RouteTable(config) {
	this.table = Tree();
}

RouteTable.prototype.childRoutes = function(parentAddress) {
	var parentRouteKeys = parentAddress.split('-');


	var parentNode = this.table.searchNode(parentRouteKeys);

	console.log("PNODE", parentNode);

	// TODO change to return node data
	if(typeof parentNode.children == 'object')
		return parentNode.children;
	return {};
};

RouteTable.prototype.toRouteOperations = function(filter) {
	var routeOperationsInsert = [];
	this.table.traverseNodesData(function(nodeData, routeKeys) {
		var routePath = routeKeys.join('-');
		if(typeof filter != 'function' || filter(nodeData, routePath))
			routeOperationsInsert.push({address: routePath, cost: nodeData.cost});
	});

	return routeOperationsInsert.length == 0 ? {} : {insert: routeOperationsInsert};
};

RouteTable.prototype.routeMinCostConnection = function(destAddress) {
	var destParts = destAddress.split('-');
	var routeNodeData = this.table.search(destParts);
	if(typeof routeNodeData == 'object')
		return routeNodeData.connection;
	return undefined;
};

RouteTable.prototype.removeConnectionRoutes = function(connection) {
	var deleteRoutes = [];
	this.table.traverseNodesData(function(nodeData, routeKeys) {
		if(nodeData.connection == connection)
			deleteRoutes.push(routeKeys.join('-'));
	});

	return this.modifyRoutes({delete: deleteRoutes}, connection);
};

RouteTable.prototype.modifyRoutes = function(routeOperations, connection) {
	var routeTable = this;
	var operationsCompleted = {};

	if(Array.isArray(routeOperations.delete)) {
		console.log("DELROUTES", routeOperations.delete);
		routeOperations.delete.forEach(function(destination) {
			if(typeof destination == 'string' && routeTable.removeRoute(destination, connection)) {
				if(!Array.isArray(operationsCompleted.delete))
					operationsCompleted.delete = [];
				if(operationsCompleted.delete.indexOf(destination) < 0)
					operationsCompleted.delete.push(destination);
			}
		});
	}

	if(Array.isArray(routeOperations.insert)) {
		routeOperations.insert.forEach(function(insertRoute) {
			if(typeof insertRoute.address == 'string' && typeof insertRoute.cost == 'number' && routeTable.insertRoute(insertRoute.address, connection, insertRoute.cost)) {
				if(!Array.isArray(operationsCompleted.insert))
					operationsCompleted.insert = [];
				if(operationsCompleted.insert.indexOf(insertRoute) < 0)
					operationsCompleted.insert.push(insertRoute);
			}
		});
	}

	return operationsCompleted;
};

RouteTable.prototype.insertRoute = function(destAddress, connection, cost) {
	var destParts = destAddress.split('-');
	var routeNode = this.table.searchNode(destParts);

	// Insert if no route exists, existing cost is higher or connection of existing is the same as new
	if(typeof routeNode == 'undefined' || typeof routeNode.data == 'undefined' || routeNode.data.cost > cost || routeNode.data.connection == connection) {
		this.table.add(destParts, {cost: cost, connection: connection});
		return true;
	}
	return false;
};

RouteTable.prototype.removeRoute = function(destAddress, connection) {
	var destParts = destAddress.split('-');
	var routeNodeData = this.table.search(destParts);

	// Remove if node's connection matches (router no longer has route)
	if(typeof routeNodeData == 'object' && routeNodeData.connection == connection) {
		this.table.remove(destParts);
		return true;
	}
	return false;
};

RouteTable.prototype.nextHop = function(destination) {
	return this.table.closest(destination.split('-'));
};

module.exports = function(config) {
	return new RouteTable(config);
};
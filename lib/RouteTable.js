var Utils = require('./Utils');
var Tree = require('./Trie');

function RouteTable(config) {
	this.table = Tree();
}

RouteTable.prototype.routeMinCostConnection = function(destAddress) {
	var destParts = destAddress.split('-');
	var routeNodeData = this.table.search(destParts);
	var minCostEntry = undefined;
	if(Array.isArray(routeNodeData) && routeNodeData.length > 0) {
		for(var index = 0; index < routeNodeData.length; index++) {
			if(minCostEntry == 'undefined' || routeNodeData[index].cost < minCostEntry.cost)
				minCostEntry = routeNodeData[index];
		}
	}
	return minCostEntry;
};

RouteTable.prototype.modifyRoutesCostChange = function(routeOperations, connection) {
	var oldRouteCosts = {};

};

RouteTable.prototype.modifyRoutes = function(routeOperations, connection) {
	var routeTable = this;
	var operationsCompleted = {};

	if(Array.isArray(routeOperations.delete)) {
		routeOperations.delete.forEach(function(destination) {
			if(typeof destination == 'string' && routeTable.removeRoute(destination)) {
				if(!Array.isArray(operationsCompleted.delete))
					operationsCompleted.delete = [];
				if(operationsCompleted.delete.indexOf(destination) < 0)
					operationsCompleted.delete.push(destination);
			}
		});
	}
	if(Array.isArray(routeOperations.insert)) {
		routeOperations.insert.forEach(function(insertRoute) {
			if(typeof insertRoute.dest == 'string' && typeof insertRoute.cost == 'number' && routeTable.addRoute(insertRoute.dest, connection, insertRoute.cost)) {
				if(!Array.isArray(operationsCompleted.insert))
					operationsCompleted.insert = [];
				if(operationsCompleted.insert.indexOf(insertRoute) < 0)
					operationsCompleted.insert.push(insertRoute);
			}
		});
	}

	return operationsCompleted;
};

RouteTable.prototype.removeRoute = function(destAddress, connection) {
	var destParts = destAddress.split('-');
	var routeNodeData = this.table.search(destParts);
	if(typeof routeNodeData != 'undefined') { // path in table
		for(var index = 0; index < routeNodeData.length; index++) {
			if(routeNodeData[index].connection == connection) { // route through connection exists
				routeNodeData.splice(index, 1); // remove the route
				console.log(this.table.trie);
				if(routeNodeData.length == 0) // remove the node when there are no routes to the address
					this.table.remove(destParts);
				return true;
			}
		}
	}
	return false;
};

RouteTable.prototype.addRoute = function(destAddress, connection, cost) {
	var destParts = destAddress.split('-');
	var routeNode = this.table.searchNode(destParts);
	var hop = {connection: connection, cost: cost};
	if(typeof routeNodeData != 'undefined') { // path already in table
		if(!Array.isArray(routeNode.data))
			routeNode.data = [];

		for(var index = 0; index < closestRoute.data.length; index++) {
			if(routeNode.data[index].connection == hop.connection) { // route through connection exists
				if(routeNode.data[index].cost == hop.cost) // no change
					return false;
				else {
					routeNode.data[index] = hop;
					return true;
				}
			}
		}

		routeNode.data.push(hop); // route through connection does not exist, add it
	}
	else // path not in table
		this.table.add(destParts, [hop]);
	return true;
};

RouteTable.prototype.nextHop = function(destination) {

	var next = this.table.closest(destination.split('-'));
	console.log("nextHop", next);
};

RouteTable.prototype.toArray = function() {


};

module.exports = function(config) {
	return new RouteTable(config);
};
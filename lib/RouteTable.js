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
			if(typeof minCostEntry == 'undefined' || routeNodeData[index].cost < minCostEntry.cost)
				minCostEntry = routeNodeData[index];
		}
	}
	return minCostEntry;
};

RouteTable.prototype.modifyRoutesCostChange = function(routeOperations, connection) {
	// TODO homogenize route operations
	var routeTable = this;
	var oldRouteCosts = {};

	var operationsChanged = {};

	if(Array.isArray(routeOperations.delete)) {
		routeOperations.delete.forEach(function(destination) {
			oldRouteCosts[destination] = routeTable.routeMinCostConnection(destination);
		});
	}

	if(Array.isArray(routeOperations.insert)) {
		routeOperations.insert.forEach(function (insertRoute) {
			oldRouteCosts[insertRoute.dest] = routeTable.routeMinCostConnection(insertRoute.dest);
		});
	}

	var operationsCompleted = routeTable.modifyRoutes(routeOperations, connection);

	if(Array.isArray(operationsCompleted.delete)) {
		operationsCompleted.delete.forEach(function(destination) {
			var minCostConnection = routeTable.routeMinCostConnection(destination);
			var minCost = typeof minCostConnection == 'undefined' ? undefined : minCostConnection.cost;
			if(minCost != oldRouteCosts[destination]) { // has cost changed
				if(minCost == undefined) {// delete route through this router\
					if(!Array.isArray(operationsChanged.delete))
						operationsChanged.delete = [];
					operationsChanged.delete.push(destination);
				}
				else {
					if(!Array.isArray(operationsChanged.insert))
						operationsChanged.insert = [];
					operationsChanged.insert.push({dest: destination, cost: minCost});
				}
			}
		});
	}

	if(Array.isArray(operationsCompleted.insert)) {
		operationsCompleted.insert.forEach(function(insertRoute) {
			var destination = insertRoute.dest;
			var minCostConnection = routeTable.routeMinCostConnection(destination);
			var minCost = typeof minCostConnection == 'undefined' ? undefined : minCostConnection.cost;
			if(minCost != oldRouteCosts[destination]) { // has cost changed
				if(minCost == undefined) {// delete route through this router\
					if(!Array.isArray(operationsChanged.delete))
						operationsChanged.delete = [];
					operationsChanged.delete.push(destination);
				}
				else {
					if(!Array.isArray(operationsChanged.insert))
						operationsChanged.insert = [];
					operationsChanged.insert.push({dest: destination, cost: minCost});
				}
			}
		});
	}

	return operationsChanged;
};

RouteTable.prototype.modifyRoutes = function(routeOperations, connection) {
	var routeTable = this;
	var operationsCompleted = {};

	if(Array.isArray(routeOperations.delete)) {
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

	if(Array.isArray(routeNodeData)) { // path in table
		for(var index = 0; index < routeNodeData.length; index++) {
			if(routeNodeData[index].connection == connection) { // route through connection exists
				routeNodeData.splice(index, 1); // remove the route
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
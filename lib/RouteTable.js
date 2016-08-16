function RouteTable(config) {
	this.table = require('./Trie')();
}

RouteTable.prototype.addRoutes = function(routes) {

	console.log("addRoutes", routes);
	// returns changes to trie
};

RouteTable.prototype.addRoute = function(route) {

	console.log("addRoutes", routes);
	// returns changes to trie
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
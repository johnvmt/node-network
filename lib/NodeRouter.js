var RouteTable = require('./RouteTable');

/*
Do not advertise children; just advertise self

AAAA (advertise AAAA*)
AAAA-1111, connected to BBBB-1111 (advertise AAAA-1111(0), AAAA(1))
BBBB

{
	<uniqueId>: {
		address:
		link:
		hops: 1
		cost: 1
}]
// http://serverfault.com/questions/499760/difference-between-routing-and-forwarding-table/499764
When table changes, send out new routes

Advertise self with cost 0, do not advertise subnets of self
Only advertise on changes, when changes involve min cost through this router changing (or route disappearing)

What happens when we have BBBB/3 and BBBB-1/4?
Calculate if we have shorter path to prent of av

DHCP requests must be made
Ad requests are transmitted
*/


function NodeRouter(config) {
	this.config = config;
	this.addresses = [];
	this.connections = [];

	this._routeTable = RouteTable();

}

NodeRouter.prototype.addConnection = function(connection) {

	connection.on('data', function(data) {
		console.log('data', data);
	});

	connection.connect(function() {
		console.log("READY");
		connection.emit('12345');
	});

};

NodeRouter.prototype.incrementString = function(stringToIncrement, stringBase, increment) {
	return (parseInt(stringToIncrement, stringBase) + increment).toString(stringBase);
};

NodeRouter.prototype.allocateAddress = function(destination) {
	// calculate max addresses under current scheme
	// getNext address (assign sequentially)
};

module.exports = function(config) {
	return new NodeRouter(config)
};
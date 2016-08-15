/**
 *
 *
 * @param config
 * @constructor
 */

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
Unless path to a child of the parent is shorter than the path to the parent, keep only parent path
eg: From BBBB-1111, have path to BBBB-1111 via BBBB...just keep BBBB
Don't advertise routes longer than your own


*/


function NodeRouter(config) {
	this.config = 123;



}


NodeRouter.prototype.incrementString = function(stringToIncrement, stringBase, increment) {
	return (parseInt(stringToIncrement, stringBase) + increment).toString(stringBase);
};

NodeRouter.prototype.nextHopLink = function(destination) {


	var trie = {
		'aaaa': {
			children: {
				'1': {
					link: {linkAddr: 'aaaa-1'},
					children: {
						'1': {
							link: {linkAddr: 'aaaa-1-1'}
						},
						'2': {
							link: {linkAddr: 'aaaa-2-1'}
						}
					}
				},
				'2': {
					link: {linkAddr: 'aaaa-2'}
				}
			},
			link: {linkAddr: 'aaaa'}
		},
		'bbbb': {
			link: {linkAddr: 'bbbb'}
		}
	};



};

NodeRouter.prototype.allocateAddress = function(destination) {
	// calculate max addresses under current scheme
	// getNext address (assign sequentially)
};

module.exports = function(config) {
	return new NodeRouter(config)
};
function RouteTable(config) {
	this.trie = {};

}

RouteTable.prototype.addRoutes = function(routes) {

	// returns changes to trie
};

RouteTable.prototype.nextHop = function(destination) {
	var destinationSubnets = destination.split('-');

	console.log(destinationSubnets);
	var closestmatch = searchTrie(trie, destinationSubnets);

	console.log(closestmatch);



	function validSubnet(subTrie) {

	}
};

RouteTable.prototype.searchPath = function(trie, path, filter, returnAll) {

	
	function searchTrie(trie, subnets, subnetIndex) {
		if(typeof subnetIndex != 'number')
			subnetIndex = 0;
		var subnet = subnets[subnetIndex];

		if(typeof trie[subnet] == 'object') {
			if(subnetIndex < subnets.length && typeof trie[subnet].children == 'object') {
				var subResult = searchTrie(trie[subnet].children, subnets, subnetIndex + 1);
				if (typeof subResult != 'undefined')
					return subResult;
			}

			if(typeof trie[subnet].link != 'undefined')
				return {address: subnets.slice(0, subnetIndex + 1).join('-'), node: trie[subnet]};
		}

		return undefined;
	}


};

RouteTable.prototype.toArray = function() {


};

module.exports = function(config) {
	return new RouteTable(config);
};
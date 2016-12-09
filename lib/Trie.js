/**
 * Created by jmurphy on 8/14/16.
 */
function Trie() {
	this.trie = {};
}

Trie.prototype.childrenOf = function(pathKeys) {
	for(var index in pathKeys) { // loop over keys
		if(typeof trieNode['children'] != 'object' || typeof trieNode['children'][pathKeys[index]] != 'object') // reached end of tree
			return;
		trieNode = trieNode['children'][pathKeys[index]]; // descend into child node
	}
	console.log(trieNode);
};

/**
 * Add a node's
 * @param pathKeys
 * @param data
 */
Trie.prototype.add = function(pathKeys, data) {
	var trieNode = this.trie;
	for(var index in pathKeys) {
		if(typeof trieNode['children'] != 'object')
			trieNode['children'] = {};

		if(typeof trieNode['children'][pathKeys[index]] != 'object')
			trieNode['children'][pathKeys[index]] = {};

		trieNode = trieNode['children'][pathKeys[index]];
	}

	trieNode.data = data;
};

/**
 * Get data from node at specified path
 * @param pathKeys
 * @returns {*}
 */
Trie.prototype.search = function(pathKeys) {
	var searchNode = this.searchNode(pathKeys);
	return typeof searchNode == 'undefined' ? undefined : searchNode.data;
};

/**
 * Get node at specified path
 * @param pathKeys
 * @returns {undefined}
 */
Trie.prototype.searchNode = function(pathKeys) {
	var closestNode = this.closestNode(pathKeys);
	return (typeof closestNode != 'undefined' && closestNode.path.length == pathKeys.length) ? closestNode.node : undefined;
};
/**
 * Traverse all the nodes beneath rootNode (or the root of the trie, if rootNode is undefined)
 * @param callback
 * @param [rootNode]
 * @param [rootNodePath]
 */
Trie.prototype.traverseNodes = function(callback, rootNode, rootNodePathKeys) {
	if(!Array.isArray(rootNodePathKeys))
		var rootNodePathKeys = [];

	if(typeof rootNode != 'object')
		var rootNode = this.trie;

	callback(rootNode, rootNodePathKeys);
	if(typeof rootNode.children) {
		var childKey;
		for(childKey in rootNode.children) {
			if (rootNode.children.hasOwnProperty(childKey))
				this.traverseNodes(callback, rootNode.children[childKey], rootNodePathKeys.concat(childKey));
		}
	}
};

/**
 * Traverse all the nodes beneath rootNode (or the root of the trie, if rootNode is undefined), which contain data
 * @param callback
 * @param [rootNode]
 * @param [rootNodePath]
 */
Trie.prototype.traverseNodesData = function(callback, rootNode, rootNodePathKeys) {
	this.traverseNodes(function (node, nodePathKeys) {
		if(typeof node.data != 'undefined')
			callback(node.data, nodePathKeys);
	}, rootNode, rootNodePathKeys);
};

/**
 * Get data from node in specified path at or closest to end of path, where node must contain data
 * @param pathKeys
 * @returns {object}
 */
Trie.prototype.closest = function(pathKeys) {
	var closestNode = this.closestNode(pathKeys);
	return typeof closestNode == 'undefined' ? undefined : {path: closestNode.path, data: closestNode.node.data};
};

/**
 * Get node in given path at or closest to end of path, where node must contain data
 * @param pathKeys
 * @returns {undefined}
 */
Trie.prototype.closestNode = function(pathKeys) {
	var matched = undefined;
	this.pathForEach(pathKeys, function(matchedNode, matchedNodePath) {
		if(typeof matchedNode.data != 'undefined')
			matched = {path: matchedNodePath, node: matchedNode};
	});
	return matched;
};

/**
 * Get data from all nodes in path that contain data
 * @param pathKeys
 * @returns {Array}
 */
Trie.prototype.inPath = function(pathKeys) {
	var matches = [];
	this.pathForEach(pathKeys, function(matchedNode, matchedNodePath) {
		if(typeof matchedNode.data != 'undefined')
			matches.push({path: matchedNodePath, data: matchedNode.data});
	});
	return matches;
};

/**
 * Get all nodes in path that contain data
 * @param pathKeys
 * @returns {Array}
 */
Trie.prototype.inPathNodes = function(pathKeys) {
	var matches = [];
	this.pathForEach(pathKeys, function(matchedNode, matchedNodePath) {
		if(typeof matchedNode.data != 'undefined')
			matches.push({path: matchedNodePath, node: matchedNode});
	});
	return matches;
};

/**
 * Trigger callback on each node in the path
 * @param pathKeys
 * @param callback
 */
Trie.prototype.pathForEach = function(pathKeys, callback) {
	var trieNode = this.trie; // start at root
	callback(trieNode, []);

	for(var index in pathKeys) { // loop over keys
		if(typeof trieNode['children'] != 'object' || typeof trieNode['children'][pathKeys[index]] != 'object') // reached end of tree
			return;
		trieNode = trieNode['children'][pathKeys[index]]; // descend into child node
		callback(trieNode, pathKeys.slice(0, index + 1));
	}
};

/**
 * Get all nodes in path, including those that contain no data
 * @param pathKeys
 * @returns {Array}
 */
Trie.prototype.inPathNodesEmpty = function(pathKeys) {
	var matches = [];
	this.pathForEach(pathKeys, function(matchedNode, matchedNodePath) {
		matches.push({path: matchedNodePath, node: matchedNode});
	});
	return matches;
};

/**
 * Remove node's data, while leaving any children intact
 * @param pathKeys
 * @returns {boolean}
 */
Trie.prototype.remove = function(pathKeys) {
	var nodes = this.inPathNodesEmpty(pathKeys);
	if(nodes.length != pathKeys.length + 1) // node does not exist
		return false;

	var deletionNode = nodes.pop();
	delete deletionNode.node.data;

	if(typeof deletionNode.node.children == 'object' && Object.keys(deletionNode.node.children).length > 0) // deletion node has children, do not prune branch
		return true;

	if(deletionNode.path.length > 0) // deletion node is not root
		delete nodes[nodes.length - 1].node.children[deletionNode.path.pop()]; // delete node from child list of parent

	for(var index = nodes.length - 1; index >= 0; index--) { // travel up the tree
		if(typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length == 0) // node just deleted was the only child
			delete nodes[index].node.children;

		if(typeof nodes[index].node.data != "undefined" || (typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length > 0)) // stop when we find a node with data or that leads to another branch
			return true;

		if(index > 0)
			delete nodes[index - 1].node.children[nodes[index].path.pop()]; // delete node from child list of parent
	}

	return true;
};

/**
 * Remove node, and any children below it
 * @param pathKeys
 * @returns {boolean}
 */
Trie.prototype.removeNode = function(pathKeys) {
	var nodes = this.inPathNodesEmpty(pathKeys);
	if(nodes.length != pathKeys.length + 1) // node does not exist
		return false;

	var deletionNode = nodes.pop();
	delete deletionNode.node.data;

	//if(typeof deletionNode.node.children == 'object' && Object.keys(deletionNode.node.children).length > 0) // deletion node has children, do not prune branch
	//	return true;

	if(deletionNode.path.length > 0) // deletion node is not root
		delete nodes[nodes.length - 1].node.children[deletionNode.path.pop()]; // delete node from child list of parent

	for(var index = nodes.length - 1; index >= 0; index--) { // travel up the tree
		if(typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length == 0) // node just deleted was the only child
			delete nodes[index].node.children;

		if(typeof nodes[index].node.data != "undefined" || (typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length > 0)) // stop when we find a node with data or that leads to another branch
			return true;

		delete nodes[index - 1].node.children[nodes[index].path.pop()]; // delete node from child list of parent
	}

	return true;
};

module.exports = function() {
	return new Trie();
};
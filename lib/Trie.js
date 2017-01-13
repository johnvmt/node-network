var Utils = require('./Utils');

function Trie() {
	this.trie = {};
}

/**
 * Get node data at the specified path, if it exists
 * @param pathKeys
 */
Trie.prototype.get = function(pathKeys) {
	var node = this.getNode(pathKeys);
	return typeof node == 'object' && typeof node.data != 'undefined' ? node.data : undefined;
};

/**
 * Get a specified node or return undefined if it does not exist
 * @param pathKeys
 */
Trie.prototype.getNode = function(pathKeys) {
	var trieNode = this.trie; // start at root
	for(var index in pathKeys) { // loop over keys
		if(typeof trieNode['children'] != 'object' || typeof trieNode['children'][pathKeys[index]] != 'object') // reached end of tree
			return;
		trieNode = trieNode['children'][pathKeys[index]]; // descend into child node
	}
	return trieNode;
};

/**
 * Set node data, will create the node if it does not exist
 * @param pathKeys
 * @param nodeData
 */
Trie.prototype.set = function(pathKeys, nodeData) {
	var trieNode = this.trie;
	for(var index in pathKeys) {
		if(typeof trieNode['children'] != 'object') // create child object in node, if it does not exist
			trieNode['children'] = {};

		if(typeof trieNode['children'][pathKeys[index]] != 'object') // create child node
			trieNode['children'][pathKeys[index]] = {};

		trieNode = trieNode['children'][pathKeys[index]];
	}

	trieNode.data = nodeData;
};

/**
 * Remove node's data, while leaving any children intact
 * @param pathKeys
 * @returns {boolean}
 */
Trie.prototype.remove = function(pathKeys) {
	var nodes = this.inPathNodes(pathKeys);
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
	var nodes = this.inPathNodes(pathKeys); // TODO possible to do this without using array?
	if(nodes.length != pathKeys.length + 1) // node does not exist
		return false;

	var deletionNode = nodes.pop();
	delete deletionNode.node.data;

	if(deletionNode.path.length > 0) // deletion node is not root
		delete nodes[nodes.length - 1].node.children[deletionNode.path.pop()]; // delete node from child list of parent

	for(var index = nodes.length - 1; index >= 0; index--) { // travel up the tree
		if(typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length == 0) // node just deleted was the only child
			delete nodes[index].node.children;

		if(typeof nodes[index].node.data != "undefined" || (typeof nodes[index].node.children == 'object' && Object.keys(nodes[index].node.children).length > 0)) // stop when we find a node with data or that leads to another branch
			return true;

		if(typeof nodes[index - 1] != 'undefined')
			delete nodes[index - 1].node.children[nodes[index].path.pop()]; // delete node from child list of parent
	}

	return true;
};

/**
 * Return children nodes as an object, or undefined if parent doesn't exist
 * @param pathKeys
 * @returns {*}
 */
Trie.prototype.children = function(pathKeys) {

	var childrenNodes = this.childrenNodes(pathKeys);
	if(typeof childrenNodes == 'undefined')
		return undefined;
	else {
		var childrenNodesData = {};
		Utils.objectForEach(childrenNodes, function(childNode, childNodeKey) {
			if(typeof childNode.data != 'undefined')
				childrenNodesData[childNodeKey] = childNode.data;
		});
		return childrenNodesData;
	}
};

/**
 * Return children nodes as an object, or undefined if parent doesn't exist
 * @param pathKeys
 * @returns {*}
 */
Trie.prototype.childrenNodes = function(pathKeys) {
	var parentNode = this.getNode(pathKeys);
	if(typeof parentNode != 'object') // parent doesn't exist
		return undefined;
	else if(typeof parentNode.children != 'object') // parent doesn't have children
		return {};
	else
		return parentNode.children;
};

// TODO make callback last argument
/**
 * Traverse all the nodes beneath rootNode (or the root of the trie, if rootNode is undefined), which contain data
 * @param callback
 * @param [rootNode]
 * @param [rootNodePathKeys]
 */
Trie.prototype.traverse = function(callback, rootNode, rootNodePathKeys) {
	this.traverseNodes(function (node, nodePathKeys) {
		if(typeof node.data != 'undefined')
			callback(node.data, nodePathKeys);
	}, rootNode, rootNodePathKeys);
};

// TODO make callback last argument
/**
 * Traverse all the nodes beneath rootNode (or the root of the trie, if rootNode is undefined)
 * @param callback
 * @param [rootNode]
 * @param [rootNodePathKeys]
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
 * Get data from node in specified path at or closest to end of path, where node must contain data
 * @param pathKeys
 * @returns {object}
 */
Trie.prototype.deepest = function(pathKeys) {
	var deepestTrieNodeData = undefined;
	var deepestTrieNodePathKeys = undefined;
	this.descend(pathKeys, function(trieNodeData, trieNodePathKeys) {
		deepestTrieNodeData = trieNodeData;
		deepestTrieNodePathKeys = trieNodePathKeys;
	});
	return (typeof deepestTrieNodePathKeys == 'undefined') ? undefined : {pathKeys: deepestTrieNodePathKeys, data: deepestTrieNodeData};
};

// TODO deepestNode?

/**
 * Trigger callback on each node in the path that contains data
 * @param pathKeys
 * @param callback
 */
Trie.prototype.descend = function(pathKeys, callback) {
	this.descendNodes(pathKeys, function(trieNode, trieNodePathKeys) {
		if(typeof trieNode.data != 'undefined')
			callback(trieNode.data, trieNodePathKeys);
	});
};

/**
 * Trigger callback on each node in the path
 * @param pathKeys
 * @param callback
 */
Trie.prototype.descendNodes = function(pathKeys, callback) {
	var trieNode = this.trie; // start at root
	callback(trieNode, []); // return the root

	for(var index = 0; index < pathKeys.length; index++) { // loop over keys
		if(typeof trieNode['children'] != 'object' || typeof trieNode['children'][pathKeys[index]] != 'object') // reached end of tree
			return;
		trieNode = trieNode['children'][pathKeys[index]]; // descend into child node
		callback(trieNode, pathKeys.slice(0, index+1));
	}
};

/**
 * Get all nodes in path, including those that contain no data
 * @param pathKeys
 * @returns {Array}
 */
Trie.prototype.inPathNodes = function(pathKeys) {
	var matches = [];
	this.descend(pathKeys, function(matchedNodeData, matchedNodePath) {
		matches.push({path: matchedNodePath, data: matchedNodeData});
	});
	return matches;
};

/**
 * Get all nodes in path, including those that contain no data
 * @param pathKeys
 * @returns {Array}
 */
Trie.prototype.inPathNodes = function(pathKeys) {
	var matches = [];
	this.descendNodes(pathKeys, function(matchedNode, matchedNodePath) {
		matches.push({path: matchedNodePath, node: matchedNode});
	});
	return matches;
};

module.exports = function() {
	return new Trie();
};
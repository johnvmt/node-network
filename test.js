/**
 * Created by jmurphy on 8/13/16.
 */
/*
var trie = require('./lib/Trie')();

//trie.add(['aaaa'], "aaaa");
trie.add(['aaaa', '1'], "aaaa-1");
trie.add(['bbbb', '1'], "bbbb-1");
trie.add([], "root");

console.log(trie.removeNode(['aaaa']));
console.log(JSON.stringify(trie.trie));
*/

// Create DS
var router_ds = require('./lib/NodeRouter')({address: 'dsnyc1', _id: "dsnyc1"});

// Create DS-1, Link to DS
var router_ds_1 = require('./lib/NodeRouter')({_id: "dsnyc1-1"});

var link_ds_ds_1 = require('./lib/VirtualLink')();
router_ds.addConnection(link_ds_ds_1.connection1);
router_ds_1.addConnection(link_ds_ds_1.connection2);

// Create DS-1-1, Link to DS-1
var router_ds_1_1 = require('./lib/NodeRouter')({_id: "dsnyc1-1-1"});
var link_ds_1_ds_1_1 = require('./lib/VirtualLink')();
router_ds_1.addConnection(link_ds_1_ds_1_1.connection1);
router_ds_1_1.addConnection(link_ds_1_ds_1_1.connection2);



// Create DS2, Link to DS1
var router_ds2 = require('./lib/NodeRouter')({address: 'dsnyc2'});
var link_ds_ds2 = require('./lib/VirtualLink')();
router_ds2.addConnection(link_ds_ds2.connection1);
router_ds.addConnection(link_ds_ds2.connection2);

console.log("R1-ADR", router_ds.address);
console.log("R2-ADR", router_ds_1.address);
console.log("R3-ADR", router_ds_1_1.address);
console.log("R4-ADR", router_ds2.address);

router_ds._setAddress("dsnyc3");

//console.log(router_ds2._routeTable.toRouteOperations());
console.log('--------------------------------');

router_ds_1_1.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});

router_ds2.send('dsnyc1-1-1', "MYMESSAGE");

/*
console.log("op1", router1._routeTable.modifyRoutes({
	delete: ['aaaa', 'aaaa-1'],
	insert: [{dest: 'aa', cost: 2}, {dest: 'aa-1', cost: 3}]
}, link.connection1));

//console.log("MINCOST", router1._routeTable.routeMinCostConnection('aa-1'));

//console.log(router1._routeTable.table.trie);

console.log("op2", router1._routeTable.removeConnectionRoutes(link.connection1));

console.log(router1._routeTable.table.trie);

//console.log(router1._routeTable.table.trie['children']['aa']['data']);

/*
console.log("op1", router1._routeTable.modifyRoutesCostChange({
	delete: ['aaaa', 'aaaa-1'],
	insert: [{dest: 'aa', cost: 2}, {dest: 'aa-1', cost: 3}]
}, link.connection1));

console.log("op2", router1._routeTable.modifyRoutesCostChange({
	insert: [{dest: 'aa', cost: 3}]
}, link.connection1));

console.log("op3", router1._routeTable.modifyRoutesCostChange({
	insert: [{dest: 'aa', cost: 1}]
}, link.connection1));

console.log("op4", router1._routeTable.modifyRoutesCostChange({
	delete: ['aa']
}, link.connection1));

console.log(router1._routeTable.table.trie);

//router1._routeTable.table.add(['aaaa'], [{connection: link.connection1, cost: 3}]);
//trie.add(['aaaa', '1'], "aaaa-1");

//console.log(router1._routeTable.addRoute('aaaa', link.connection1, 2));
//console.log(router1._routeTable.addRoute('aaaa-1', link.connection1, 2));

//console.log(router1._routeTable.table.trie['children']['aaaa']['data']);

//router1._routeTable.removeRoute('aaaa', link.connection1);

//console.log("REMOVE");
//console.log(router1._routeTable.table.trie);
/*
link.connection1.on('data', function(data) {
	console.log("CONNECTION1", data);
});

link.connection2.on('data', function(data) {
	console.log("CONNECTION2", data);
});

link.connection1.emit("MESSAGE1");
link.connection2.emit("MESSAGE2");
*/

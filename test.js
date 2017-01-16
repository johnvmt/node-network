// Create DS
var router_ds = require('./lib/NodeRouter')({address: 'dsnyc1', _id: "dsnyc1"});

// Create DS-1, Link to DS
var router_ds_1 = require('./lib/NodeRouter')({_id: "dsnyc1-1"});

var link_ds_ds_1 = require('./lib/VirtualLink')()

router_ds.addConnection(link_ds_ds_1.connection1);
router_ds_1.addConnection(link_ds_ds_1.connection2);

link_ds_ds_1.connection1.connect();
link_ds_ds_1.connection2.connect();

router_ds.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});



// Create DS-1-1, Link to DS-1
var router_ds_1_1 = require('./lib/NodeRouter')({_id: "dsnyc1-1-1"});
var link_ds_1_ds_1_1 = require('./lib/VirtualLink')();



/*router_ds_1.on('address', function(address) {
	console.log("ROUTER 1-1 ADDRESS", address);
});*/

router_ds_1.addConnection(link_ds_1_ds_1_1.connection1);
router_ds_1_1.addConnection(link_ds_1_ds_1_1.connection2);

link_ds_1_ds_1_1.connection1.connect();
link_ds_1_ds_1_1.connection2.connect();

// Allow for address to be set
process.nextTick(function() {
	router_ds_1_1.send('dsnyc1', "MYMESSAGE");
	router_ds.send('dsnyc1-1-1', "MYMESSAGE");
});



/*

// Create DS2, Link to DS1
var router_ds2 = require('./lib/NodeRouter')({address: 'dsnyc2', _id: "dsnyc2"});
var link_ds_ds2 = require('./lib/VirtualLink')();

link_ds_ds2.connection1.connect();
link_ds_ds2.connection2.connect();

router_ds2.addConnection(link_ds_ds2.connection1);
router_ds.addConnection(link_ds_ds2.connection2);

console.log("R1-ADR", router_ds.address);
console.log("R2-ADR", router_ds_1.address);
console.log("R3-ADR", router_ds_1_1.address);
console.log("R4-ADR", router_ds2.address);

router_ds.send('dsnyc1-1', "MYMESSAGE");

//console.log(router_ds2._routeTable.toRouteOperations());
console.log('--------------------------------');

router_ds_1_1.on('message', function(message) {
	console.log("MSG ARRIVED", message);
});

console.log("SEND 2");
router_ds2.send('dsnyc1-1-1', "MYMESSAGE");
console.log("SEND 2 END");

router_ds.setAddress("ds3");

console.log("R1-ADR", router_ds.address);
console.log("R2-ADR", router_ds_1.address);
console.log("R3-ADR", router_ds_1_1.address);
console.log("R4-ADR", router_ds2.address);

console.log('--------------------------------');

console.log(JSON.stringify(router_ds2._routeTable.toRouteOperations()));

router_ds2.send('ds3-1-1', "MYMESSAGE");


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

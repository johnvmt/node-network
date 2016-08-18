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

var link = require('./lib/VirtualLink')();

var router1 = require('./lib/NodeRouter')({address: 'aaaa'});
var router2 = require('./lib/NodeRouter')();

router1.addConnection(link.connection1);
router2.addConnection(link.connection2);

console.log(router1._routeTable.modifyRoutes({
	delete: ['aaaa', 'aaaa-1'],
	insert: [{dest: 'aa', cost: 2}, {dest: 'aa-1', cost: 3}]
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

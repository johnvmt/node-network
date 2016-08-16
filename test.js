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

var link = require('./VirtualLink')();

var router1 = require('./lib/NodeRouter')({address: 'aaaa'});
var router2 = require('./lib/NodeRouter')();

router1.addConnection(link.connection1);
router2.addConnection(link.connection2);

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

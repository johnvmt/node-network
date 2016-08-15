/**
 * Created by jmurphy on 8/13/16.
 */
var trie = require('./lib/Trie')();

//trie.add(['aaaa'], "aaaa");
trie.add(['aaaa', '1'], "aaaa-1");
trie.add(['bbbb', '1'], "bbbb-1");
trie.add([], "root");

console.log(trie.removeNode(['aaaa']));
console.log(JSON.stringify(trie.trie));

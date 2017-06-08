var assert = require('assert');
var trie = require('../src/Trie')();

describe('Trie Functions', function(){
	describe('Getters/Setters', function(){
		it('set aaaa-bbbb', function(done) {
			trie.set(['aaaa', 'bbbb'], 'aaaa-bbbb');
			if(trie.trie.children.aaaa.children.bbbb.data == 'aaaa-bbbb')
				done();
			else
				throw new Error("Insertion failed");
		});

		it('get aaaa-bbbb', function(done) {
			if(trie.get(['aaaa', 'bbbb']) == 'aaaa-bbbb')
				done();
			else
				throw new Error("Retrieval returned " + trie.get(['aaaa', 'bbbb']));
		});

		it('get aaaa-bbbb node', function(done) {
			if(trie.getNode(['aaaa', 'bbbb']).data == 'aaaa-bbbb')
				done();
			else
				throw new Error("Retrieval returned " + trie.get(['aaaa', 'bbbb']));
		});

		it('remove aaaa-bbbb data', function(done) {
			if(trie.remove(['aaaa', 'bbbb']) && trie.trie.children == undefined)
				done();
			else
				throw new Error("Removal failed");
		});

		it('remove aaaa-bbbb node and children', function(done) {
			trie.set(['aaaa', 'bbbb'], 'aaaa-bbbb');
			trie.set(['aaaa', 'bbbb', 'cccc'], 'aaaa-bbbb-cccc');
			if(trie.get(['aaaa', 'bbbb']) == 'aaaa-bbbb' && trie.get(['aaaa', 'bbbb', 'cccc']) == 'aaaa-bbbb-cccc') {
				// Insertion succeeded
				trie.removeNode(['aaaa', 'bbbb']);
				if(JSON.stringify(trie.trie) == '{}')
					done();
				else
					throw new Error("Trie not empty");
			}
			else
				throw new Error("Retrieval returned " + trie.get(['aaaa', 'bbbb']));
		});

		it('find deepest node aaaa-bbbb', function(done) {
			trie.set(['aaaa', 'bbbb'], 'aaaa-bbbb');
			trie.set(['aaaa', 'bbbb', 'cccc'], 'aaaa-bbbb-cccc');
			var deepest = trie.deepest(['aaaa', 'bbbb']);
			if(deepest.data == 'aaaa-bbbb')
				done();
			else
				throw new Error("Incorrect deepest");
		});

		it('find deepest node aaaa-dddd (doesn\'t exist)', function(done) {
			trie.set(['aaaa', 'bbbb'], 'aaaa-bbbb');
			trie.set(['aaaa', 'bbbb', 'cccc'], 'aaaa-bbbb-cccc');
			var deepest = trie.deepest(['aaaa', 'bbbb', 'dddd']);
			if(deepest.data == 'aaaa-bbbb')
				done();
			else
				throw new Error("Incorrect deepest");
		});
	});
});
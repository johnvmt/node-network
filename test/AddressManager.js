var assert = require('assert');
var AddressManager = require('../src/AddressManager');

describe('AddressManager Functions', function() {
	describe('Setup', function() {
		it('Throw error if base address not set', function(done) {
			try {
				var manager = AddressManager();
			}
			catch(error) {
				if(error.message == 'base_address_not_set')
					done();
				else
					throw error;
			}
			throw new Error('error not triggered');
		});

		it('Initialize with baseAddress set', function(done) {
			var manager = AddressManager(['baseaddr']);
			done();
		});
	});

	describe('Allocate', function() {
		it('Allocates a single address', function(done) {
			var baseAddr = ['part1', 'part2'];
			var manager = AddressManager(baseAddr);

			var address = manager.allocate();
			if(!arraysEqual(address, baseAddr.concat(['1'])))
				throw new Error('Allocated address is not in correct format');

			done();
		});

		it('Allocates multiple address', function(done) {
			var baseAddr = ['part1', 'part2'];
			var manager = AddressManager(baseAddr);

			var address1 = manager.allocate();
			if(!arraysEqual(address1, baseAddr.concat(['1'])))
				throw new Error('1st allocated address is not in correct format');

			var address2 = manager.allocate();
			if(!arraysEqual(address2, baseAddr.concat(['2'])))
				throw new Error('2nd allocated address is not in correct format');

			done();
		});
	});

	describe('AddressIsEqual', function() {
		it('Tests whether two equal addresses are equal', function(done) {
			var baseAddr = ['part1', 'part2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsEqual(['part1', 'part2', 'part3'], ['part1', 'part2', 'part3']))
				done();
			else
				throw new Error("Addresses are not evaluated to equal");
		});

		it('Tests whether two unequal addresses are equal', function(done) {
			var baseAddr = ['part1', 'part2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsEqual(['part1', 'part2', 'part4'], ['part1', 'part2', 'part3']))
				throw new Error("Addresses evaluated to equal");
			else
				done();
		});

		it('Tests whether two unequal addresses of unequal length are equal', function(done) {
			var baseAddr = ['part1', 'part2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsEqual(['part1', 'part2'], ['part1', 'part2', 'part3']))
				throw new Error("Addresses evaluated to equal");
			else
				done();
		});
	});

	describe('AddressIsChild', function() {
		it('Tests whether a child address evaluates as child, not under baseAddress', function(done) {
			var baseAddr = ['base1', 'base2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsChild(['part1', 'part2', 'part3'], ['part1', 'part2']))
				done();
			else
				throw new Error("Does not evaluate as child");
		});

		it('Tests whether a child address evaluates as child, under baseAddress', function(done) {
			var baseAddr = ['base1', 'base2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsChild(baseAddr.concat(['part3']), baseAddr))
				done();
			else
				throw new Error("Does not evaluate as child");
		});

		it('Tests whether a child address evaluates as child, from baseAddress', function(done) {
			var baseAddr = ['base1', 'base2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsChild(baseAddr.concat(['part3'])))
				done();
			else
				throw new Error("Does not evaluate as child");
		});
	});

	describe('AddressIsParent', function() {
		it('Tests whether a parent address evaluates as parent, not above baseAddress', function(done) {
			var baseAddr = ['base1', 'base2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsParent(['part1', 'part2'], ['part1', 'part2', 'part3']))
				done();
			else
				throw new Error("Does not evaluate as parent");
		});

		it('Tests whether a parent address evaluates as parent, above baseAddress', function(done) {
			var baseAddr = ['base1', 'base2', 'base3'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsParent(['base1', 'base2'], baseAddr))
				done();
			else
				throw new Error("Does not evaluate as parent");
		});

		it('Tests whether a parent address evaluates as parent, from baseAddress', function(done) {
			var baseAddr = ['base1', 'base2'];
			var manager = AddressManager(baseAddr);

			if(manager.addressIsParent(['base1']))
				done();
			else
				throw new Error("Does not evaluate as child");
		});
	});

	function arraysEqual(a, b) {
		if (a === b) return true;
		if (a == null || b == null) return false;
		if (a.length != b.length) return false;

		for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
});
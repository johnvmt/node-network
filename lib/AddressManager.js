function AddressManager(config) {
	if(Array.isArray(config.baseAddress))
		this._baseAddress = config.baseAddress;
	else
		throw new Error('base_address_not_set');
	this._max = '0';
	this._stringBase = 36;
}

/**
 * Allocate an address to a child
 * @returns {string}
 */
AddressManager.prototype.allocate = function() {
	this._max = this._incrementString(this._max, this._stringBase, 1);
	return this._baseAddress.concat(this._max);
	// calculate max addresses under current scheme
	// getNext address (assign sequentially)
};

/**
 * Test whether addresses are equal
 * Default address2 is Address Manager's base address
 * @param address1
 * @param [address2]
 */
AddressManager.prototype.addressIsEqual = function(address1, address2) {
	if(!Array.isArray(address2))
		address2 = this._baseAddress;

	if(address1.length == address2.length) {
		var index;
		for (index = 0; index < address2.length; index++) {
			if (address1[index] != address2[index])
				return false;
		}
		return true; // all address1 parts match, and address1 is same length as address2
	}
	else // address2 is different length from address1
		return false;
};

/**
 * Test whether an address is a child of another address
 * Default parent address is Address Manager's base address
 * @param childAddress
 * @param [parentAddress]
 * @returns {boolean}
 */
AddressManager.prototype.addressIsChild = function(childAddress, parentAddress) {
	if(!Array.isArray(parentAddress))
		parentAddress = this._baseAddress;

	if(childAddress.length > parentAddress.length) {
		var index;
		for (index = 0; index < parentAddress.length; index++) {
			if (childAddress[index] != parentAddress[index])
				return false;
		}
		return true; // all child parts match, and child is longer than parent
	}
	else // Child is shorter than parent
		return false;
};

/**
 * Test whether an address is a parent of another address
 * Default child address is Address Manager's base address
 * @param parentAddress
 * @param [childAddress]
 * @returns {boolean}
 */
AddressManager.prototype.addressIsParent = function(parentAddress, childAddress) {
	if(!Array.isArray(childAddress))
		childAddress = this._baseAddress;

	return this.addressIsChild(childAddress, parentAddress);
};

/**
 * Increment stringToIncrement with the given base by increment
 * @param stringToIncrement
 * @param stringBase
 * @param increment
 * @returns {string}
 * @private
 */
AddressManager.prototype._incrementString = function(stringToIncrement, stringBase, increment) {
	return (parseInt(stringToIncrement, stringBase) + increment).toString(stringBase);
};

module.exports = function(baseAddress) {
	return new AddressManager(baseAddress);
};
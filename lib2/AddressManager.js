function AddressManager(baseAddress) {
	if(Array.isArray(baseAddress))
		this._baseAddress = baseAddress;
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
	return Array.concat(this._baseAddress, this._max);
	// calculate max addresses under current scheme
	// getNext address (assign sequentially)
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
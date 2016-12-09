function AddressManager(config) {
	this._seperator = '-';
	this._baseAddress = typeof config == "object" && typeof config.baseAddress == "string" ? config.baseAddress : ''; // TODO uniqueId address?
	this._max = '0';
	this._stringBase = 36;
}

/*
TODO: Add is-child-of function
 */


AddressManager.prototype.allocate = function() {
	this._max = this.incrementString(this._max, this._stringBase, 1);

	return this._baseAddress + this._seperator + this._max;
	// calculate max addresses under current scheme
	// getNext address (assign sequentially)
};

AddressManager.prototype.incrementString = function(stringToIncrement, stringBase, increment) {
	return (parseInt(stringToIncrement, stringBase) + increment).toString(stringBase);
};

module.exports = function(baseAddress) {
	return new AddressManager(baseAddress);
};
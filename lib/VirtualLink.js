var EventEmitter = require('wolfy87-eventemitter');

function VirtualConnection() {
	var connection = this;
	connection._emitter = new EventEmitter();
	connection.connected = false;
	connection._connectionRequested = false;

	connection.on('connect', function() {
		connection.connected = true;
	});

	connection.on('disconnect', function() {
		connection.connected = false;
	});
}

VirtualConnection.prototype.connect = function(callback) {
	this._connectionRequested = true;
	if(this.connected)
		callback();
	else {
		this.once('connect', callback);
		this._emitter.emit('connectionRequest');
	}
};

VirtualConnection.prototype.emit = function(data) {
	this._emitter.emit('transmit', data);
};

VirtualConnection.prototype.on = function(eventType, eventCallback) {
	this._emitter.on(eventType, eventCallback);
};

VirtualConnection.prototype.once = function(eventType, eventCallback) {
	this._emitter.once(eventType, eventCallback);
};

VirtualConnection.prototype.off = function(eventType, eventCallback) {
	this._emitter.off(eventType, eventCallback);
};

VirtualConnection.prototype.receive = function(data) {
	this._emitter.emit('data', data);
};

module.exports = function() {

	var connection1 = new VirtualConnection();
	var connection2 = new VirtualConnection();

	connection1.on('transmit', function(messageType, messageData) {
		connection2.receive(messageType, messageData);
	});

	connection2.on('transmit', function(messageType, messageData) {
		connection1.receive(messageType, messageData);
	});

	connection2.on('connectionRequest', function() {
		if(connection1._connectionRequested) {
			connection1._emitter.emit('connect');
			connection2._emitter.emit('connect');
		}
	});

	connection1.on('connectionRequest', function() {
		if(connection2._connectionRequested) {
			connection1._emitter.emit('connect');
			connection2._emitter.emit('connect');
		}
	});

	return {connection1: connection1, connection2: connection2};
};
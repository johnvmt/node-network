/**
 * Created by jmurphy on 8/15/16.
 */

var EventEmitter = require('event-emitter');

function VirtualLink() {

	var connection1 = this._newConnection();
	var connection2 = this._newConnection();

	connection1.on('transmit', function(messageType, messageData) {
		connection2.receive(messageType, messageData);
	});

	connection2.on('transmit', function(messageType, messageData) {
		connection1.receive(messageType, messageData);
	});

	this.connection1 = connection1;
	this.connection2 = connection2;
}

VirtualLink.prototype._newConnection = function () {
	return {
		_emitter: EventEmitter({}),
		status: 'starting',
		connect: function(callback) {
			if(this.status == 'ready')
				callback();
			else
				this.once('ready', callback);
		},
		on: function(eventType, eventCallback) {
			this._emitter.on(eventType, eventCallback);
		},
		once: function(eventType, eventCallback) {
			this._emitter.once(eventType, eventCallback);
		},
		off: function(eventType, eventCallback) {
			this._emitter.off(eventType, eventCallback);
		},
		emit: function(data) {
			this._emitter.emit('transmit', data);
		},
		receive: function(data) {
			this._emitter.emit('data', data);
		}
	};
};

module.exports = function() {
	return new VirtualLink()
};
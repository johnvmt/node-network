var NodeRouter = require('./src/NodeRouter');
var VirtualLink = require('./src/VirtualLink');

// Create DS
var router_ds = NodeRouter({address: 'dsnyc1', _id: "dsnyc1"});

// Create DS-1, Link to DS
var router_ds_1 = NodeRouter({_id: "dsnyc1-1"});

var link_ds_ds_1 = VirtualLink();

router_ds.addConnection(link_ds_ds_1.connection1);
router_ds_1.addConnection(link_ds_ds_1.connection2);

link_ds_ds_1.connection1.connect();
link_ds_ds_1.connection2.connect();



router_ds_1.on('message', function(message) {
	console.log("MSG ARRIVED", message);


});

router_ds.send('dsnyc1-1', "MYMESSAGE");



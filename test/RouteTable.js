var assert = require('assert');
var RouteTable = require('../src/RouteTable');

describe('RouteTable Functions', function() {
	describe('insertRoute', function() {
		it('Insert route into route table', function(done) {
			var routeTable = RouteTable();

			var routeMeta = {
				connectionKey: 1,
				cost: 2
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta.connectionKey, routeMeta.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta, insertedRouteMeta))
				done();
			else
				throw new Error("Route metadata does not match");
		});

		it('Insert same route twice, on same connection, second has lower cost', function(done) {
			var routeTable = RouteTable();

			var routeMeta1 = {
				connectionKey: 1,
				cost: 2
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta1.connectionKey, routeMeta1.cost);

			var routeMeta2 = {
				connectionKey: 1,
				cost: 1
			};

			routeTable.insertRoute(routePath, routeMeta2.connectionKey, routeMeta2.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta2, insertedRouteMeta))
				done();
			else
				throw new Error("Route metadata does not match");
		});

		it('Insert same route twice, on same connection, second has higher cost', function(done) {
			var routeTable = RouteTable();

			var routeMeta1 = {
				connectionKey: 1,
				cost: 2
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta1.connectionKey, routeMeta1.cost);

			var routeMeta2 = {
				connectionKey: 1,
				cost: 3
			};

			routeTable.insertRoute(routePath, routeMeta2.connectionKey, routeMeta2.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta2, insertedRouteMeta))
				done();
			else
				throw new Error("Route metadata does not match");
		});

		it('Insert same route twice, on different connection, second has lower cost', function(done) {
			var routeTable = RouteTable();

			var routeMeta1 = {
				connectionKey: 1,
				cost: 2
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta1.connectionKey, routeMeta1.cost);

			var routeMeta2 = {
				connectionKey: 2,
				cost: 1
			};

			routeTable.insertRoute(routePath, routeMeta2.connectionKey, routeMeta2.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta2, insertedRouteMeta))
				done();
			else
				throw new Error("Route metadata does not match");
		});

		it('Insert same route twice, on different connection, second has higher cost', function(done) {
			var routeTable = RouteTable();

			var routeMeta1 = {
				connectionKey: 1,
				cost: 2
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta1.connectionKey, routeMeta1.cost);

			var routeMeta2 = {
				connectionKey: 2,
				cost: 3
			};

			routeTable.insertRoute(routePath, routeMeta2.connectionKey, routeMeta2.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta1, insertedRouteMeta))
				done();
			else
				throw new Error("Route metadata does not match");
		});
	});

	describe('removeRoute', function() {
		it('Insert route into route table, then remove it', function(done) {
			var routeTable = RouteTable();

			var routeMeta = {
				connectionKey: 1,
				cost: 1
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta.connectionKey, routeMeta.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta, insertedRouteMeta)) {

				routeTable.removeRoute(routePath, routeMeta.connectionKey);

				if(typeof routeTable.table.get(routePath) != 'undefined')
					throw new Error("Not removed");
				else
					done();
			}
			else
				throw new Error("Route not inserted");
		});

		it('Insert route into route table, then try to remove route with different connection key', function(done) {
			var routeTable = RouteTable();

			var routeMeta = {
				connectionKey: 1,
				cost: 1
			};

			var routePath = ['part1', 'part2'];

			routeTable.insertRoute(routePath, routeMeta.connectionKey, routeMeta.cost);

			var insertedRouteMeta = routeTable.table.get(routePath);

			if(deepEqual(routeMeta, insertedRouteMeta)) {
				routeTable.removeRoute(routePath, routeMeta.connectionKey + 1);

				if(typeof routeTable.table.get(routePath) == 'undefined')
					throw new Error("Route improperly removed");
				else
					done();
			}
			else
				throw new Error("Route not inserted");
		});
	});

	describe('removeConnectionRoutes', function() {
		it('Insert routes into route table, then remove all from this connection', function(done) {
			var routeTable = RouteTable();

			var routeMeta = {
				connectionKey: 1,
				cost: 1
			};

			var routePath1 = ['part1a', 'part2a'];
			var routePath2 = ['part1b', 'part2b'];

			routeTable.insertRoute(routePath1, routeMeta.connectionKey, routeMeta.cost);
			routeTable.insertRoute(routePath2, routeMeta.connectionKey, routeMeta.cost);

			if(typeof routeTable.table.get(routePath1) == 'undefined' || typeof routeTable.table.get(routePath2) == 'undefined')
				throw new Error("Routes not inserted");
			else {
				routeTable.removeConnectionRoutes(routeMeta.connectionKey);

				if(typeof routeTable.table.get(routePath1) == 'undefined' || typeof routeTable.table.get(routePath2) == 'undefined')
					done();
				else
					throw new Error("Routes not removed");
			}

		});
	});

	function deepEqual(x, y) {
		if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
			if (Object.keys(x).length != Object.keys(y).length)
				return false;

			for(var prop in x) {
				if(y.hasOwnProperty(prop)) {
					if (! deepEqual(x[prop], y[prop]))
						return false;
				}
				else
					return false;
			}
			return true;
		}
		else if(x !== y)
			return false;
		else
			return true;
	}

});
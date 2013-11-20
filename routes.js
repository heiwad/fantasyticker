var uu = require('underscore');

var RouteHandler = require('./routehandler');

var routeHandler = new RouteHandler();

var define_routes = function (dict) {
    var toroute = function(item) {
	return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    '/' : routeHandler.defaultRoute,
    '/index.html' : routeHandler.defaultRoute,
    '/get_oauth_token': routeHandler.get_oauth_token,
    '/oauth_callback': routeHandler.handle_oauth_callback
});


module.exports = ROUTES;

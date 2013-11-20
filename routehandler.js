//Node libraries
var request = require('request');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var uu = require('underscore');
var async = require('async');
var crypto = require('crypto');


var YahooAuth = require('./yahooauth');

function RouteHandler() {

    this.yahooAuth = new YahooAuth();

}

RouteHandler.prototype.defaultRoute = function (req, res) {

    res.send('Woohoo! Hello world');

};



RouteHandler.prototype.get_oauth_token = function (req, res) {

    this.yahooAuth.init(function (err, res) {
	var outstring = '';
	if (err) {

	    outstring = 'Error auth with yahoo - ' + err;

	}
	else {
	    outstring = 'Successful auth with yahoo - ' + res;
	}

	console.log(outstring);
	res.send(outstring);

    });


};

RouteHandler.prototype.handle_oauth_callback = function (req, res) {};



module.exports = RouteHandler;

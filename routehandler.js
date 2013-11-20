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

    this.yahooAuth = {
	auth_status:'not connected'
    };

}

RouteHandler.prototype.defaultRoute = function (req, res) {

    var auth_url = '';
    if ( this && this.yahooAuth && this.yahooAuth.xoauth_request_auth_url !== '' ) {
	auth_url = this.yahooAuth.xoauth_request_auth_url;
	res.render("homepage", {title:'Fantasy Ticker', auth_url:auth_url});
    } else {

	//If there isn't a server connection to yahoo, create one and then show homepage
	this.yahooAuth = new YahooAuth();
	var _this = this;
	this.yahooAuth.init( function (err, value) {

	    var auth_url = _this.yahooAuth.xoauth_request_auth_url;
	    res.render("homepage", {title:'Fantasy Ticker', auth_url: auth_url});
	});

    }



//  res.send(homepage);

};


RouteHandler.prototype.get_oauth_token = function (req, res) {

    this.yahooAuth = new YahooAuth();

    this.yahooAuth.init( function (err, value) {

	var outstring = '';
	if (err) {

	    outstring = 'Error auth with yahoo - ' + err;

	}
	else {
	    outstring = 'Successful auth with yahoo - ' + value;
	}

	console.log(outstring);
	res.send(outstring);

    });

};

RouteHandler.prototype.handle_oauth_callback = function (req, res) {

    console.log('Oauth callback called! Do something with it.');
    //TODO: Implement this

};


module.exports = RouteHandler;

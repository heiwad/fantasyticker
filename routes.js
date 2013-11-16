var request = require('request');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var uu = require('underscore');
var async = require('async');
var crypto = require('crypto');


var serverToken = '';
var serverTokenSecret = '';
var serverAuthURL = '';

var yahooConfig = {};

var initYahooConfig = function () {

    yahooConfig.getTokenURI = 'https://api.login.yahoo.com/oauth/v2/get_token';
    yahooConfig.get_signature_method = function () { return 'HMAC-SHA1';};
    yahooConfig.sign_options = function (options, done) {};

};


var userYahooCreds = {

    oauth_token: '',
    ouath_token_secret:'',
    oauth_session_handle: '',
    oauth_expires_in: '',
    oauth_authorization_expires_in: '',
    xoauth_yahoo_guid: '',
};

//Note that the token expires in one hour. need to refresh it every 30 minutes - more often if it fails.


var queryYahooUserData = function (uri, userAuth, serverAuth) {

    var requestHandler =  function (e, r, body) {
	if (e) {
	    console.log('Response: ' + r.statusCode + '- ' + e);
	} else {
	    console.log('Response: ' + r.statusCode + '- ' + body);
	}
    };

    var defaultURI = 'http://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/teams';

    var query_auth = {

	consumer_key: process.env.YAHOO_KEY,
	consumer_secret: process.env.YAHOO_SECRET,
	token: userAuth.oauth_token,
	token_secret: userAuth.oauth_token_secret
    };

request ( {uri:uri, oauth:query_auth }, requestHandler);

};

var saveUserToken = function (userAuth) {

   //Need to put this in an instance variable

//    _userTokens.push(userAuth);


};


var yahooHandler = function (req, res) {

    console.log(req.query);

    exchangeRequestTokenForAccessToken(req.query.oauth_token, req.query.oauth_verifier);
    res.send("Welcome to the fantasy ticker!", 200);



};


var exchangeRequestTokenForAccessToken = function (token, verifier, token_secret) {


    //rewrite this to use the signing capabilities of request.

    console.log('Performing token exchange for user');
    console.log('Token: ' + token);
    console.log('Verifier ' + verifier);
    var uri = 'https://api.login.yahoo.com/oauth/v2/get_token';

    var queryString = {};

    queryString.oauth_consumer_key = process.env.YAHOO_KEY;
    queryString.oauth_signature_method = 'PLAINTEXT';
    queryString.oauth_nonce = 'AaaB';
    queryString.oauth_signature = process.env.YAHOO_SECRET + '&' + token_secret;
    queryString.oauth_timestamp = Date.now() / 1000;
    queryString.oauth_version = '1.0';

    queryString.oauth_verifier = verifier;
    queryString.oauth_token = token;

    var options = {
	uri: uri,
	qs: queryString,
	headers: {},
	method: 'GET'
    };

    request(options, function (err, response, body) {

	console.log('Token exchange request complete');
	if (!err)
	    console.log('Response Code: ' + response.statusCode + '- ' + body);
	else
	    console.log('Response Code : ' + response.statusCode + '- ' + err);

	});

};

var requestYahooAuth = function (req, res) {

    var key = encodeURIComponent(process.env.YAHOO_SECRET) + '&';

    var uri = 'https://api.login.yahoo.com/oauth/v2/get_request_token';

    var signAuthReq = function (method, key, options, done) {

	if (options.qs.oauth_signature_method === 'plaintext') {
	    options.qs.oauth_signature = key;
	    done(null, options);
	    return;
	} else {

	    var paramList = [];
	    for (var option in options.qs) {

		var entry = encodeURIComponent(option) +
		    '=' + encodeURIComponent(options.qs[option]);

		paramList.push(entry);
	    }

	    paramList = paramList.sort();
	    var paramString = paramList.join('&');

	    var signatureBase = method.toUpperCase();
	    signatureBase += '&' + encodeURIComponent(options.uri);
	    signatureBase += '&' + encodeURIComponent(paramString);

	    var hmac = crypto.createHmac('sha1', key);
	    hmac.setEncoding('base64');
	    hmac.write(signatureBase);
	    hmac.end();

	    var digest = hmac.read();
	    options.qs.oauth_signature = digest;
	    return options;
	}

    };

    var wrapSignMethod = function (method, key, uri, done) {

	var setOptions = function (err, res) {
	    if (err){
		done(err);
	    } else {
		var queryString = {};

		queryString.oauth_timestamp = Date.now() / 1000;
		queryString.oauth_consumer_key = encodeURIComponent(process.env.YAHOO_KEY);
		queryString.oauth_signature_method = 'HMAC-SHA1';
		queryString.oauth_version = '1.0';
		queryString.oauth_callback =
		    'http://teleporterlabs.cloudapp.net/oauth_callback' ;

		var options = {
		    uri: uri,
		    qs: queryString,
		    headers: {},
		    method: method
		};

		options.qs.oauth_nonce = res.toString('hex');

		var signedOptions =  signAuthReq(method, key, options);

		done(null, signedOptions);
	    }
	};

	return setOptions;
    };

    var authRequestHandler = function (err, response, body) {

	if (err){
	    console.log('Error requesting auth: ' + err);
	    res.send(err);
	}
	else {

	    var authinfo = qs.parse(body);
	    var outstring = 'Received auth response from Yahoo: ' + response.statusCode;


	    for (var field in authinfo) {
		outstring += '\n   ' + field + ': ' + authinfo[field];
	    }

	    console.log(outstring);
	    res.send(outstring);
	}
    };

    var requestToken = function (err, options) {

	console.log('Submitting auth request. Query options are:');
	for (var option in options.qs) {
	    console.log('   ' + option + ': ' + options.qs[option]);
	    }
	    request(options, authRequestHandler);
    };

    var getOptions = wrapSignMethod("GET", key, uri, requestToken);

    //Initiate by getting nonce and starting chain of event handlers
    crypto.randomBytes(16, getOptions);


};


//-----------------------------------------------------
var defaultRoute = function (req, res) {

    res.send('Woohoo! Hello world');
 //   sendFile('./index.html', res);

};

var define_routes = function (dict) {
    var toroute = function(item) {
	return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};


var ROUTES = define_routes({
    '/' : defaultRoute,
    '/index.html' : defaultRoute,
    '/oauth_callback': yahooHandler,
    '/get_auth_token': requestYahooAuth
    });

module.exports = ROUTES;

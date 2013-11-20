var request = require('request');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var uu = require('underscore');
var async = require('async');
var crypto = require('crypto');


//For future scalability, these keys should be migrated to storage (ie REDIS/MONGO)

function YahooAuth () {

    this.oauth_consumer_key = '';
    this.oauth_consumer_secret = '';
    this.oauth_callback_uri = '';

    this.server_token = {
	    oauth_token: '',
	    oauth_token_secret: '',
	    oauth_session_handle: '',
	    oauth_expires_in: '',
    };

    this.CONFIG = {
	OAUTH_SIGNATURE_METHOD: 'HMAC-SHA1',
	OAUTH_VERSION: '1.0'
    };

    this.oauth_callback = '';
    this.xoauth_request_auth_url = '';

    this.refreshTimer = undefined;

    this.interval = 30*60*1000; //set refresh interval
    this.yahoo_auth_uris =  {
	get_token: 'https://api.login.yahoo.com/oauth/v2/get_token',
	get_request_token: 'https://api.login.yahoo.com/oauth/v2/get_request_token'

    };

    this.query_uris = {
	get_teams: 'http://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/teams'
    };

    this.authenticated_users = [];

}

YahooAuth.prototype.init = function (init_complete) {

    var _this = this; // save reference to this object

    //Load config from environment

    var OAUTH_CALLBACK_ROUTE = '/oauth_callback';

    this.oauth_consumer_secret = process.env.YAHOO_SECRET;
    this.oauth_consumer_key = process.env.YAHOO_KEY;
    this.oauth_callback_uri = process.env.APP_URI + OAUTH_CALLBACK_ROUTE;

    var REQUEST_TOKEN_KEY = this.oauth_consumer_secret + '&';
    var uri = this.yahoo_auth_uris.get_request_token;


    //Set up the functions needed request the creds from yahoo

    //TODO: Refactor this to be simpler and just use request library for signing.
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
		queryString.oauth_consumer_key = _this.oauth_consumer_key; //WATCHOUT FOR THIS!!
		queryString.oauth_signature_method = _this.CONFIG.OAUTH_SIGNATURE_METHOD;
		queryString.oauth_version = _this.CONFIG.OAUTH_VERSION;
		queryString.oauth_callback = _this.oauth_callback_uri;

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

	return setOptions; //Returning a function here!
    };

    var authRequestHandler = function (err, response, body) {

	if (err){
	    console.log('Error requesting auth: ' + err);
	    init_complete(err, _this); // done callback passed into parent init method
	}
	else {

	    var authinfo = qs.parse(body);
	    var outstring = 'Received auth response from Yahoo: ' + response.statusCode;


	    console.log(outstring);
	    //if authinfo.oauth_callback_confirmed not true, there may be a problem. check this

	    //Saving YAHOO Credential response
	    _this.server_token.oauth_token = authinfo.oauth_token;
	    _this.server_token.oauth_token_secret = authinfo.oauth_token_secret;
	    _this.server_token.oauth_expires_in = authinfo.oauth_expires_in;
	    _this.xoauth_request_auth_url = authinfo.xoauth_request_auth_url;

	    init_complete(null, _this); //Done callback passed into parent Init method

	}
    };

    var requestToken = function (err, options) {

	console.log('Submitting request for server auth token');

	    request(options, authRequestHandler);
    };

    var getOptions = wrapSignMethod("GET", REQUEST_TOKEN_KEY, uri, requestToken);

    //Initiate by getting nonce and starting chain of event handlers
    crypto.randomBytes(16, getOptions);

};

YahooAuth.prototype.setRefresh = function (interval) {

    if (interval === undefined || isNan(interval)) {
    this.interval = 30*60*1000; //set refresh interval
    } else (this.interval = interval);

    if (interval < 0) {
	if(this.refreshTimer) clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(this.init, this.interval);

};


YahooAuth.prototype.save_user = function (user_creds) {
    //TODO: Migrate this to Redis to allow the server to be stateless.
    var userYahooCreds = { };

    userYahooCreds.oauth_token = user_creds.oauth_token;
    userYahooCreds.oauth_token_secret = user_creds.user_oauth_token_secret;
    userYahooCreds.oauth_session_handle = user_creds.oauth_session_handle;
    userYahooCreds.oauth_expires_in = user_creds.oauth_expires_in;
    userYahooCreds.oauth_authorization_expires_in = user_creds.oauth_authorization_expires_in;
    userYahooCreds.xoauth_yahoo_guid = user_creds.xoauth_yahoo_guid;



    console.log('Saving user credentials...');
    for (var key in userYahooCreds) {
	console.log('   ' + key + ' - ' + userYahooCreds[key]);
    }

    this.authenticated_users.push(userYahooCreds);
};



//    load_config: function () {},
//    request_token: function () {},
//    get_user_auth_url: function () {},

//    exchange_user_token: function () {},
//    save_user: function () {},
//    get_user: function () {},




module.exports = YahooAuth;

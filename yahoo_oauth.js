var request = require('request');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var uu = require('underscore');
var async = require('async');
var crypto = require('crypto');

var save_user = function (user_creds) {

    var userYahooCreds = {

    oauth_token: '',
    ouath_token_secret:'',
    oauth_session_handle: '',
    oauth_expires_in: '',
    oauth_authorization_expires_in: '',
    xoauth_yahoo_guid: '',
    };

    this.user_cred_store.push(userYahooCreds);

};


var yahoo_model = {

    load_config: function () {},
    request_token: function () {},
    get_user_auth_url: function () {},
    
    exchange_user_token: function () {},
    save_user: function () {},
    get_user: function () {},

    server_creds: {
	oauth_consumer_key: '',
	oauth_signature_method:'',
	oauth_callback: '',
	
	token: {
	    oauth_token: '',
	    oauth_token_secret: '',
	    oauth_session_handle: '',
	    oauth_expires_in: '',
	    xoauth_request_auth_url: ''
	}
    },
    user_cred_store: {},
    
    yahoo_auth_uris: {
	get_token: 'https://api.login.yahoo.com/oauth/v2/get_token',
	get_request_token: 'https://api.login.yahoo.com/oauth/v2/get_request_token',
	
    },
    yahoo_query_uris:{
	get_teams: 'http://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/teams';

    }

};

module.exports = yahoo_model; //ToDo: Figure this out.

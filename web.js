var fs = require('fs');
var http = require('http');
var express = require('express');

var app = express();

app.set('port', process.env.PORT || 8080);

var sendFile = function (file, response) {

    fs.readFile(file, function (err, result) {

	if (err) {
	    response.send('Could not retrieve requested resource', 404);
	} else {
	    response.send(result.toString());
	}
    });

};


app.get('/', function (request, response) {

    sendFile('./index.html', response);

});

app.get('/index.html', function (request, response) {

    sendFile('./index.html', response);

});



http.createServer(app).listen(app.get('port'), function () {
    console.log("Listening on " + app.get('port'));
});

var express = require('express')
  , http = require('http')
  , path = require('path')
  , ROUTES = require('./routes');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(express.logger("dev"));


for (var ii in ROUTES) {
    app.get(ROUTES[ii].path, ROUTES[ii].fn);
}

http.createServer(app).listen(app.get('port'), function () {
    console.log("Listening on " + app.get('port'));
});


/**
 * Module dependencies.
 */

var express = module.exports = require('express');
var conf = require('./conf');

require('datejs');

var https = require('https');

var mongoose = require('mongoose');
var mongooseAuth = require('mongoose-auth');

require('./models/User')(mongoose, mongooseAuth);
require('./models/Competition')(mongoose);
require('./models/Entry')(mongoose);
mongoose.connect('mongodb://localhost/osgcc');

var app = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true });
  app.use(express.bodyParser());
  app.use(express.static(__dirname + "/public"));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'osgccsecret'}));
  app.use(mongooseAuth.middleware());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('*', function(req, res, next) {
  mongoose.model('Competition').find({
    'start':{'$gt':Date.parse('yesterday')},
    'end':{'$lt':Date.parse('2 days from now')}
  },
  function(err, docs) {
    res.local('current_comps', docs);
    next();
  });
});

require('./controllers/home')(app);
require('./controllers/competition')(app);

mongooseAuth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

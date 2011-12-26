
/**
 * Module dependencies.
 */

var express = module.exports = require('express');
var conf = require('./conf');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var mongooseAuth = require('mongoose-auth');

var UserSchema = new Schema({});
var User;

UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    }
  , facebook: true
  , github: {
      everyauth: {
          myHostname: conf.github.hostname
        , appId: conf.github.appId
        , appSecret: conf.github.appSecret
        , redirectPath: conf.github.redirect
      }
    }
});

mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/osgcc');

User = mongoose.model('User');

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

var routes = {
  home: require('./routes/home'),
  _banner: require('./routes/_banner')
};

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/_banners', routes._banner.list);
app.get('/_banner/:id', routes._banner.view);

mongooseAuth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

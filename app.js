
/**
 * Module dependencies.
 */

var express = module.exports = require('express');
var conf = require('./conf');

var async = require('async');

require('datejs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var mongooseAuth = require('mongoose-auth');

var crypto = require('crypto');

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

CompetitionSchema = new Schema({
    name        : String
  , start       : Date
  , end         : Date
  , salt        : {type:String, default:(+new Date()).toString(16)}
});

CompetitionSchema.methods.isPast = function() {
  return this.end.isBefore();
}

CompetitionSchema.methods.isUpcoming = function() {
  return this.start.isAfter();
}

mongoose.model('Competition', CompetitionSchema);

mongoose.model('Entry', new Schema({
    competition : ObjectId
  , name        : String
  , github      : String
}));

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

var current_comps = function(callback) {
  mongoose.model('Competition').find({
    'start':{'$gt':Date.parse('yesterday')},
    'end':{'$lt':Date.parse('2 days from now')}
  },callback);
}

app.get('/', function(req, res) {
  async.parallel({
    current_comps: current_comps
  },
  function(err, results) {
    res.render('home', results);
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/competition/:id', function(req, res) {
  async.parallel({
    current_comps: current_comps,
    comp: function(callback) {
      mongoose.model('Competition').findById(req.params.id,callback);
    },
    entries: function(callback) {
      mongoose.model('Entry').find({competition:req.params.id},callback);
    }
  },
  function(err, results) {
    if (req.loggedIn) {
      // competition.salt is randomly generated for each competition
      // Hash the user id with the comp_salt.
      // comp_salt is not publicly accessible so only the
      // user will see this url.
      var cipher = crypto.createCipher('aes-128-cbc',''+results.comp.salt);
      var crypted = cipher.update(''+req.user._id, 'ascii', 'hex');
      crypted += cipher.final('hex');
      results.entryURL = crypted;
    }
    res.render('competition', results);
  });
});

app.get('/competitions/past', function(req, res) {
  async.parallel({
    current_comps: current_comps,
    comps: function(callback) {
      mongoose.model('Competition').find({'end':{'$lt':new Date()}}, callback);
    }
  },
  function(err, results) {
    res.render('competitions', results);
  });
});

app.get('/competitions/upcoming', function(req, res) {
  async.parallel({
    current_comps: current_comps,
    comps: function(callback) {
      mongoose.model('Competition').find({'start':{'$gt':new Date()}}, callback);
    }
  },
  function(err, results) {
    res.render('competitions', results);
  });
});

app.get('/competition', function(req, res) {
  async.parallel({
    current_comps: current_comps
  },
  function(err, results) {
    res.render('competition_new', results);
  });
});

app.post('/competition', function(req, res) {
  var Competition = mongoose.model('Competition');
  var comp = new Competition();
  comp.name = req.param('comp_name')
  comp.start = Date.parse(req.param('start_date') + ' ' + req.param('start_time'));
  comp.end = Date.parse(req.param('end_date') + ' ' + req.param('end_time'));
  comp.on('save', function(new_comp) {
    res.redirect('/competition/'+new_comp._id);
  });
  comp.save();
});

mongooseAuth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var async = require('async');
var mongoose = require('mongoose');
var crypto = require('crypto');

module.exports = function(app) {
  app.get('/competition/:id', view);
  app.post('/competition', create_competition);
  app.get('/competition', new_competition);
  app.get('/competitions/past', past);
  app.get('/competitions/upcoming', upcoming);
}

function view(req, res) {
  async.parallel({
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
};

function past(req, res) {
  async.parallel({
    comps: function(callback) {
      mongoose.model('Competition').find({'end':{'$lt':new Date()}}, callback);
    }
  },
  function(err, results) {
    res.render('competitions', results);
  });
};

function upcoming(req, res) {
  async.parallel({
    comps: function(callback) {
      mongoose.model('Competition').find({'start':{'$gt':new Date()}}, callback);
    }
  },
  function(err, results) {
    res.render('competitions', results);
  });
};

function new_competition(req, res) {
  async.parallel({
  },
  function(err, results) {
    res.render('competition_new', results);
  });
};

function create_competition(req, res) {
  var Competition = mongoose.model('Competition');
  var comp = new Competition();
  comp.name = req.param('comp_name')
  comp.start = Date.parse(req.param('start_date') + ' ' + req.param('start_time'));
  comp.end = Date.parse(req.param('end_date') + ' ' + req.param('end_time'));
  comp.on('save', function(new_comp) {
    res.redirect('/competition/'+new_comp._id);
  });
  comp.save();
};

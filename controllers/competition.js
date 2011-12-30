var async = require('async');
var mongoose = require('mongoose');
var crypto = require('crypto');

module.exports = function(app) {
  app.get('/competition/:id', view);
  app.post('/competition', create_competition);
  app.get('/competition', new_competition);
  app.get('/competitions/past', past);
  app.get('/competitions/upcoming', upcoming);

  app.post('/competition/:id/entry', create_entry);
  app.post('/competition/:id/entry/:code/create-repo', create_repo);
  app.post('/competition/:id/entry/:code/fork-repo', fork_repo);
  app.post('/competition/:id/entry/:code/enable-hook', enable_hook);
  app.post('/competition/:id/entry/:code/test-hook', test_hook);

}

// helper function for github api
function github_api(url, token, method, callback) {
  var request = https.request({
      host: 'api.github.com'
    , path: url+'?access_token='+token
    , method: method
  },
  function(response) {
    var data = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function () {
      callback(data);
    });
  });
  request.end();
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

function create_entry(req, res) {
  var Entry = mongoose.model('Entry');
  var entry;
  async.serial({
    check: function(callback) {
      if (req.param('code')) {
        Entry.findOne({
          competition:req.params.id,
          code:req.param('code')
        },
        function(err, docs) {
          if (err) callback(err);
          else {
            entry = docs;
            callback(null, entry);
          }
        });
      }
      else {
        entry = new Entry({
          competition: req.params.id,
          name: req.param('name'),
        });
        callback(null, entry);
      }
    },
    update: function(callback) {
      entry.users.push(req.user._id);
      entry.on('save', function(new_entry) {
        callback(null, new_entry);
      });
      entry.save();
    }
  },
  function(err, results) {
    console.log(results);
    res.json(results);
  });
};

function create_repo(req, res) {
  var entry;
  async.serial({
    entry: function(callback) {
      // get entry
    },
    update: function(callback) {
      // update entry
    }
  },
  function(err, results) {
  });
};

function fork_repo(req, res) {
  var entry;
  async.serial({
    entry: function(callback) {
      // get entry
    },
    update: function(callback) {
      // update entry
    }
  },
  function(err, results) {
  });
};

function enable_hook(req, res) {
  var entry;
  async.serial({
    entry: function(callback) {
      // get entry
    },
    update: function(callback) {
      // update entry
    }
  },
  function(err, results) {
  });
};

function test_hook(req, res) {
  var entry;
  async.serial({
    entry: function(callback) {
      // get entry
    },
    update: function(callback) {
      // update entry
    }
  },
  function(err, results) {
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

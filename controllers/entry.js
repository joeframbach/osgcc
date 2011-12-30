var async = require('async');
var mongoose = require('mongoose');
var crypto = require('crypto');

module.exports = function(app) {
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


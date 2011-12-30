var async = require('async');

module.exports = function(app) {
  app.get('/', index);
  app.get('/logout', logout);
  app.get('/profile', profile);
}

function index(req, res) {
  async.parallel({
  },
  function(err, results) {
    res.render('home', results);
  });
};

function logout(req, res) {
  req.logout();
  res.redirect('/');
};

function profile(req, res) {
  if (!req.loggedIn) {
    res.redirect('/');
  }
  else {
    github_api('/user',req.session.auth.github.accessToken,'GET',function(data) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(data);
    });
  }
};


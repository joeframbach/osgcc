exports.index = function(req, res) {
  async.parallel({
    comps: function(callback) {
      mongoose.model('Competition').find(callback);
    }
  },
  function(err, results) {
    console.log(err);
    console.log(results);
    res.render('home', {comps:results.comps});
  });
};

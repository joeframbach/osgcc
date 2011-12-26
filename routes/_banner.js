exports.list = function(req, res) {
  var osgcc = require('mongode').connect('osgcc', '127.0.0.1');
  var banners = osgcc.collection('banners');
  banners.find({},{sort:'created_by'},function(err, cursor) {
    cursor.each(function(err, banner) {
      res.partial('_banner', {banner: banner});
    })
  });
};

exports.view = function(req, res) {
  res.partial('_banner', {banner:{h1:'mytitle',p:'mytext'}});
};

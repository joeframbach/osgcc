module.exports = function(mongoose, mongooseAuth) {
  var conf = require('./../conf');

  var UserSchema = new mongoose.Schema({});
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
  User = mongoose.model('User');

}

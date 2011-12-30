function entryCode() {
  charSet = 'ABCDEFGHJKLMNPQRTUVWXY346789';
  var randomString = '';
  for (var i = 0; i < 6; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

module.exports = function(mongoose) {
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var EntrySchema = new Schema({
      competition : ObjectId
    , name        : String
    , github      : String
    , code        : {type:String, default:entryCode()}
    , users       : [ObjectId]
  });

  mongoose.model('Entry', EntrySchema);
}

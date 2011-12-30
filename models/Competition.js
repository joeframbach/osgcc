module.exports = function(mongoose) {
  CompetitionSchema = new mongoose.Schema({
      name        : String
    , start       : Date 
    ,  end        : Date
    , salt        : {type:String, default:(+new Date()).toString(16)}
  });

  CompetitionSchema.methods.isPast = function() {
    return this.end.isBefore();
  }

  CompetitionSchema.methods.isUpcoming = function() {
    return this.start.isAfter();
  }

  mongoose.model('Competition', CompetitionSchema);
}

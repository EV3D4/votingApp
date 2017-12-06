var mongoose = require('mongoose');

// User Schema
var PollSchema = mongoose.Schema({
  username: {
    type: String,
    index:true
  },
  question: {
		type: String,
	},
  choices: {
    type: Number,
  },
	option1: {
    opt: String,
    vote: Number
	},
	option2: {
    opt: String,
		vote: Number
  },
  timestamp: {
    create: Number,
    update: Number,
  }

});

var Poll = module.exports = mongoose.model('Poll', PollSchema);

module.exports.createPoll = function(newPoll, callback){

	        newPoll.save(callback);

}

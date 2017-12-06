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
  option3: {
    opt: String,
    vote: Number
  },
  option4: {
    opt: String,
    vote: Number
  },
  option5: {
      opt: String,
      vote: Number
    }
})




var Poll = module.exports = mongoose.model('Poll', PollSchema);




module.exports.createPoll = function(newPoll, callback){

	        newPoll.save(callback);

}

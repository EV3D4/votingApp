var express = require('express');
var router = express.Router();
var Poll = require('../models/poll');
var Handlebars= require("handlebars");





router.get('/', ensureAuthenticated, function(req, res){

	Poll.find({username: req.user.username}, function(err, polls) {
	  if (err) throw err;

	 



		res.render('dashboard', {
			userPolls: polls,
			helpers: {
				inc: function(value) {
					return value + 1;
				},
				trim: function(string) {

					var temp = string.substring(0, 15);

					if (string.length > 15) {
						return temp += '...';
					} else
						return string
				}
			}
		});
});

});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}




module.exports = router;

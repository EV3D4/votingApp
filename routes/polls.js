var express = require('express');

var router = express.Router();
var Poll = require('../models/poll');




router.get('/', function(req, res) {

  Poll.find({}, function(err, polls) {
    if (err) throw err;



    res.render('polls', {
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

module.exports = router;

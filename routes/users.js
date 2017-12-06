var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Poll = require('../models/poll');
var dashboard = require('./dashboard');
var create = require('./create')



// Register
router.get('/register', function(req, res) {
  res.render('register');
});

// Dashboard
router.use('/dashboard', dashboard);

// Create
router.use('/create', create);

// Vote
router.get('/vote/:id', function(req, res) {

  Poll.find({}, function(err, polls) {
    if (err) throw err;

    res.render('ballot', {
      userPolls: polls[req.params.id],
			pollNumber: req.params.id
    });
  });
});


// Login
router.get(['/login', '/'], ensureAuthenticated, function(req, res) {
  res.render('login');
});

function ensureAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are already logged in');
    res.redirect('/users/dashboard');
  }
}

// Register User
router.post('/register', function(req, res) {

  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var tmpuser = "admin";
  var password = req.body.password;
  var password2 = req.body.password2;

  User.getUserByUsername(username, function(err, user) {
    if (err) throw err;
    if (user) {
      tmpuser = username;
    }
  });

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('username', 'Username already exsists').equals(tmpuser);

  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

    User.createUser(newUser, function(err, user) {
      if (err) throw err;

    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
});

router.post('/tally', function(req, res) {

  var selectpicker = req.body.selectpicker;
console.log(selectpicker)
	req.checkBody('selectpicker', 'invalid selection').exists();

	var errors = req.validationErrors();

	if (errors) {

		Poll.find({}, function(err, polls) {
			if (err) throw err;



			res.render('ballot', {

				errors: errors,
				userPolls: polls[req.body.pollNumber],
				pollNumber: req.body.pollNumber
			});
		});

	} else
	{

    let obj = {
      [selectpicker] : 1
    }

    Poll.findByIdAndUpdate(
        req.body.pollID,

         {$inc: obj },
        function(err, document) {
        console.log(err);
    });

		req.flash('success_msg', 'You voted!');

    Poll.find({}, function(err, polls) {
      if (err) throw err;
      var tempx=[polls[req.body.pollNumber].option1.vote,polls[req.body.pollNumber].option2.vote]
      var tempq=[polls[req.body.pollNumber].option1.opt,polls[req.body.pollNumber].option2.opt]
      res.render('chart', {
        userPolls: polls[req.body.pollNumber],
        userPollTallies: tempx,
        userPollLabels: tempq
      });

    });
  }

});

router.post('/save', function(req, res) {

  var question = req.body.question;
  var option1 = req.body.option1;
  var option2 = req.body.option2;


  // Validation
  req.checkBody('question', 'question is required').notEmpty();
  req.checkBody('option1', 'option1 is required').notEmpty();
  req.checkBody('option2', 'option2 is required').notEmpty();


  var errors = req.validationErrors();

  if (errors) {
    res.render('create', {
      errors: errors
    });
  } else {
    var newPoll = new Poll({
      username: req.user.username,
      question: question,
      option1: {
        opt: option1,
        vote: 0
      },
      option2: {
        opt: option2,
        vote: 0
      }
    });

    Poll.createPoll(newPoll, function(err, user) {
      if (err) throw err;

    });

    req.flash('success_msg', 'Poll Posted!');

    res.redirect('/users/dashboard');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, {
          message: 'Unknown User'
        });
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;

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
  if (req.params.id !== "jumbotron.css") {
    Poll.find({
      '_id': req.params.id
    }, function(err, polls) {
      if (err) throw err;

      res.render('ballot', {
        userPolls: polls[0],
        pollNumber: req.params.id
      });
    });
  } else(res.end())
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


// Edit Poll
router.get('/edit/:id',function(req, res) {
  if (req.params.id !== "jumbotron.css") {
  Poll.find({
    '_id': req.params.id
  }, function(err, polls) {
    if (err) throw err;

    res.render('edit', {
      question: polls[0].question,
      option1: polls[0].option1.opt,
      option2: polls[0].option2.opt,
      option3: polls[0].option3.opt,
      option4: polls[0].option4.opt,
      option5: polls[0].option5.opt,
      pollid: polls[0]._id
    });
  });
}else {res.end()}});

router.post('/tally', function(req, res) {

  var selectpicker = req.body.selectpicker;
  console.log(selectpicker)
  req.checkBody('selectpicker', 'invalid selection').exists();

  var errors = req.validationErrors();

  if (errors) {

    Poll.find({
      '_id': req.body.pollID
    }, function(err, polls) {
      if (err) throw err;



      res.render('ballot', {

        errors: errors,
        userPolls: polls[0],
        pollNumber: req.body.pollNumber
      });
    });

  }
  else {

    let obj = {
      [selectpicker]: 1
    }

    let id = req.body.pollID;

    Poll.findByIdAndUpdate(
      id,

      {
        $inc: obj
      },

      function(err, document) {
        console.log(err);
      });

    req.flash('success_msg', 'You voted!');

    Poll.find({
      '_id': req.body.pollID
    }, function(err, polls) {
      if (err) throw err;



      var tempx = [polls[0].option1.vote, polls[0].option2.vote, polls[0].option3.vote, polls[0].option4.vote, polls[0].option5.vote]
      var tempq = [polls[0].option1.opt, polls[0].option2.opt,polls[0].option3.opt, polls[0].option4.opt,polls[0].option5.opt]
      var temprx =[]
      var temprq = []


      for(x=0;x<5;x++)
      {

        if (tempq[x])

        {

          temprx.push(tempx[x])
          temprq.push(tempq[x])
        }

      }

      res.render('chart', {
        userPolls: polls[0],
        userPollTallies: temprx,
        userPollLabels: temprq
      });

    });
  }

});



router.get('/view/:id', function(req, res) {

  if (req.params.id !== "jumbotron.css") {

    Poll.find({
      '_id': req.params.id
    }, function(err, polls) {
      if (err) throw err;


      var tempx = [polls[0].option1.vote, polls[0].option2.vote, polls[0].option3.vote, polls[0].option4.vote, polls[0].option5.vote]
      var tempq = [polls[0].option1.opt, polls[0].option2.opt,polls[0].option3.opt, polls[0].option4.opt,polls[0].option5.opt]
      var temprx =[]
      var temprq = []


      for(x=0;x<5;x++)
      {

        if (tempq[x])

        {

          temprx.push(tempx[x])
          temprq.push(tempq[x])
        }

      }



      res.render('chart', {
        userPolls: polls[0],
        userPollTallies: temprx,
        userPollLabels: temprq
      });

    });
  }
  else {
    res.end()
  }




});



router.use('/delete/:id',function(req, res) {
  if (req.params.id !== "jumbotron.css") {
    Poll.findByIdAndRemove(req.params.id, function(err) {
      if (err) throw err;

      req.flash('success_msg', 'Poll Deleted!');

      res.redirect('/users/dashboard');

    });


}else {res.end()}});

router.post('/save', function(req, res) {

  var question = req.body.question;
  var option1 = req.body.option1;
  var option2 = req.body.option2;
  var option3 = req.body.option3;
  var option4 = req.body.option4;
  var option5 = req.body.option5;



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
      },
      option3: {
        opt: option3,
        vote: 0
      },
      option4: {
          opt: option4,
          vote: 0
        },
      option5: {
          opt: option5,
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

router.post('/update', function(req, res) {


  var question = req.body.question;
  var option1 = req.body.option1;
  var option2 = req.body.option2;
  var option3 = req.body.option3;
  var option4 = req.body.option4;
  var option5 = req.body.option5;
  var pollid = req.body.pollid;


  console.log(option3)

  // Validation
  req.checkBody('question', 'question is required').notEmpty();
  req.checkBody('option1', 'option1 is required').notEmpty();
  req.checkBody('option2', 'option2 is required').notEmpty();


  var errors = req.validationErrors();

  if (errors) {
    res.render('edit', {
      errors: errors,
      question:  question,
      option1: option1,
      option2: option2,
      option3: option3,
      option4: option4,
      option5: option5,
      pollid: pollid
    });
  } else {


    var newPoll = ({
      username: res.locals.user,
      question: question,
      option1: {
        opt: option1,
        vote: 0
      },
      option2: {
        opt: option2,
        vote: 0
      },
      option3: {
        opt: option3,
        vote: 0
      },
      option4: {
        opt: option4,
        vote: 0
      },
      option5: {
        opt: option5,
        vote: 0
      },
    });


    Poll.findById(pollid, function(err, poll) {
      if (err) throw err;

      poll.question = question;
      poll.option1.opt=option1;
      poll.option2.opt=option2;
      poll.option3.opt=option3;
      poll.option4.opt=option4;
      poll.option5.opt=option5;

      poll.option1.vote=0;
      poll.option2.vote=0;
      poll.option3.vote=0;
      poll.option4.vote=0;
      poll.option5.vote=0;


      // save the user
      poll.save(function(err) {
        if (err) throw err;


      });

    });







    req.flash('success_msg', 'Poll Updated!');

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

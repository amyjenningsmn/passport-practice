// NPM
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var pg = require('pg');
var localStrategy = require('passport-local').Strategy;
// we just need the strategy, so we're pulling that off of there.
var bodyParser = require('body-parser');

var app = express();

// LOCAL
var index = require('./routes/index');
var connectionString = 'postgres://localhost:5432/passport_stuff';
var encryptLib = require('../modules/encryption');



// Long hand:
// var passportLocal = require('passport-local');
// var localStrategy = passportLocal.Strategy;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// ^^^ This will connect the form data into a request.body. Without this statement, it'll be confused because it won't be json when we use jquery.


app.use(session({
  secret:'keyboard cat',
  // secret word placed on the cookie as another level of varification. commonly left as secret: 'secret' by default during development or internal use, or could be any string, or an array of strings, but they'll always use the firt one on the initial handshake, then they'll varify with the rest of strings. Joel's never seen more than one though in real world, so could just use one. Change secret from 'secret' when it goes on the web.
  resave: true,
  // forces the session to be saved back to the session store. we'd want to use this if we're having trouble dropping info from multiple sessions, kind of an overly cautious lots of saving type deal.
  saveUninitialized: false,
  // similar to 'resave:true'. save a session to the session store - the thing that's controlling who's getting what session. we're setting it false because we're in developing mode.
  cookie: {maxAge: 600000, secure: false}
  // this will grant the user temporary access in each session for a period of time since their last interaction, this is 600,000ms. The age of the session is stored in the cookie.
}))

app.use(passport.initialize());
app.use(passport.session());
// The session needs to be configured BEFORE we app.use our session. Otherwise it won't work correctly.


// Passport
// we should always use local in development
passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'
  },
  function(request, username, password, done){

    pg.connect(connectionString, function(err, client){
      var query = client.query("SELECT * FROM users WHERE username = $1", [username]);

      if(err) {
        console.log(err);
      }

      var user = {};

      query.on('row', function(row){
        // this is what we found
        console.log(row);
        user = row;

        // check password 
        if(encryptLib.comparePassword(password, user.password)){
          console.log('match!');
          done(err, user);
          } else {
          console.log('no matched found');
          done(null, false);
        }
      })

      client.on('end', function(){
        client.end();
      })

    })
  }

));
// ROUTES
app.use(express.static('server/public'));
app.use('/', index);



// LISTENING
var server = app.listen(process.env.PORT || 3000, function(){
  var portGrabbedFromLiveServer = server.address().port;
  console.log('listening on port', portGrabbedFromLiveServer);
});

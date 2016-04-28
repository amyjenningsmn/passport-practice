var router = require('express').Router();
var path = require('path');
var passport = require('passport');
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/passport_stuff';
var encryptLib = require('../../modules/encryption');


router.get('/', function(request, response){
  response.sendFile(path.join(__dirname, "../public/views/index.html"));
});

router.post('/', passport.authenticate('local', {
  // this corresopnes to passport.use('local') on server.js
  successRedirect: '/success',
  failureRedirect: '/failure'
}))

router.get('/register', function(request, response){
  response.sendFile(path.join(__dirname, "../public/views/register.html"));
});

router.get('/success', function(request, response){
  response.send('worked!');
});

router.get('/failure', function(request, response){
  response.send('did not work');
});

router.post('/register', function(request, response){
  console.log(request.body);
  pg.connect(connectionString, function(err, client){

    var user = {
    username: request.body.username,
    password: encryptLib.encryptPassword(request.body.password);
    }
    // creating a new user object with new encrypted values. We'll pass these into our query below,
    // and therefore our database


    console.log('Creating user', user);

    var query = client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [user.username, user.password]);

    query.on('error', function(err) {
      console.log(err);
    })

    query.on('end', function(){
      resonse.sendStatus(200);
      client.end();
    })
  })
});

module.exports = router;

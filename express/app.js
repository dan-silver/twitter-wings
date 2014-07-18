var express = require('express')
  , routes = require('./routes')
  , app = express()
  , path = require('path')
  , server = require("http").createServer(app)
  ;

  var arDrone = require('ar-drone');
var client  = arDrone.createClient();


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade', { pretty: true });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
    app.locals.pretty = true;
});

app.get('/', routes.index);

app.get('/test-drone', function(req, res) {
  client.takeoff();

  client.after(5000, function() {
    this.land()
  });

  res.end()
})

//var Twit = require('twit')
//config = require('./config')
//
//var T = new Twit({
//    consumer_key:         config.consumer_key
//  , consumer_secret:      config.consumer_key
//  , access_token:         config.access_token
//  , access_token_secret:  config.access_token_secret
//})
//
//var stream = T.stream('statuses/filter', { track: 'cernercopter' })
//
//stream.on('tweet', function (tweet) {
//  if (tweet.text.search("#up") != -1) {
//    console.log("going up!")
//    client.takeoff();
//  } else if (tweet.text.search("#down") != -1) {
//    console.log("going down!")
//    client.land();
//  } else if (tweet.text.search("#blink") != -1) {
//    console.log("blink!")
//    client.animateLeds('blinkRed', 5, 2)
//  } else if (tweet.text.search("#left") != -1) {
//    console.log("left")
//    client.counterClockwise(0.5)
//  }
//})

/*
 * Important:
 *
 * pass in the server object to listen, not the express app
 * call 'listen' on the server, not the express app
 */
// should be require("dronestream").listen(server);
// require("../index").listen(server);
server.listen(3000);

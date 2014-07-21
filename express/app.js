var express = require('express')
  , routes = require('./routes')
  , app = express()
  , path = require('path')
  , server = require("http").createServer(app)
  , fs = require("fs")
  , bodyParser = require('body-parser')
  , arDrone = require('ar-drone')
  , client  = arDrone.createClient()
  , asyncblock = require('asyncblock')
  , childProcess = require('child_process')
  , image_rec
  , io = require('socket.io')(server)
  , Twit = require('twit')
  , config = require('../config')

var T = new Twit({
   consumer_key:         config.consumer_key
 , consumer_secret:      config.consumer_secret
 , access_token:         config.access_token
 , access_token_secret:  config.access_token_secret
});
// Should this line go in the function below?
app.use(bodyParser({limit: '900mb'}));

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

function log(s) {
  console.log("node>" + s);
}

var stream = T.stream('statuses/filter', { track: 'obama' })
var theSocket;

io.on('connection', function (socket) {
  theSocket = socket
  socket.emit('news', { hello: 'world' });
  log('got connection');
  var votes = {};
  votes[command1] = 0;
  votes[command2] = 0;
  stream.on('tweet', function (tweet, error) {
    // log(tweet.text)
    // socket.emit("tweet", tweet)
    twt = {};
    twt["screen_name"] = tweet.user["screen_name"];
    if (tweet.text.search("#" + command1) != -1) {
      log("voted up!");
      votes[command1]++;
      twt["command"] = command1;
    } else if (tweet.text.search("#" + command2) != -1) {
      log("voted down!");
      votes[command2]++;
      twt["command"] = command2;
    }
    socket.emit("twt", twt);
  });
  // get the majority voted command every 5 seconds
  setInterval(function() {
      log("command1 votes=" + votes[command1]);
      log("command2 votes=" + votes[command2]);

      majorityCommand = command1;
      if (votes[command2] > votes[command1]) {
        majorityCommand = command2;
      }
      log("best vote was " + majorityCommand);
      // Actually tell the copter to perform the command 
      performCommand(majorityCommand);
      votes[command1] = 0;
      votes[command2] = 0;
  }, 5000);
});

function performCommand(name) {
  switch(name) {
    case "up":
        client.takeoff();
        break;
    case "down":
        client.land();
        break;
    default:
        throw new Error("performCommand called with an invalid command");
  }
}

// should be require("dronestream").listen(server);
require("../index").listen(server);
server.listen(3000);

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

app.get('/test-drone', function(req, res) {
  client.takeoff();

  client.after(5000, function() {
    this.land()
  });

  res.end()
});

var stream = T.stream('statuses/filter', { track: 'cernercopter' });

command1 = "up";
command2 = "down";
command3 = "flip";

io.on('connection', function (socket) {
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
      socket.emit("twt", twt);
    } else if (tweet.text.search("#" + command2) != -1) {
      log("voted down!");
      votes[command2]++;
      twt["command"] = command2;
      socket.emit("twt", twt);
    } else if (tweet.text.search("#" + command3) != -1) {
      log("voted flip!");
      votes[command3]++
      twt["command"] = command3;
      socket.emit("twt", twt);
    }
  });
  // get the majority voted command every 5 seconds
  setInterval(function() {
      log("command1 votes=" + votes[command1]);
      log("command2 votes=" + votes[command2]);
      log("command3 votes=" + votes[command3]);
      // TODO: set a default "stop" command here
      majorityCommand = "default";
      if (votes[command2] > votes[command1]) {
        majorityCommand = command2;
      } 
      if (votes[command3] > votes[command2]) {
        majorityCommand = command3;
      }
      log("best vote was " + majorityCommand);
      // Actually tell the copter to perform the command 
      performCommand(majorityCommand);
      votes[command1] = 0;
      votes[command2] = 0;
      votes[command3] = 0;
  }, 5000);
});

function performCommand(name) {
  switch(name) {
    case "up":
        log("copter is taking off!");
        client.takeoff();
        break;
    case "down":
        log("copter is landing!");
        client.land();
        break;
    case "flip":
        log("copter is flipping!");
        client.animate('flipLeft', 3000);
        break;
    case "flyup":
        log("copter is flying up");
        flyUp();
        break;
    case "flydown":
        log("copter is flying down");
        flyDown();
        break;
    default:
        client.stop()
  }
}

function flyUp() {
  client.up(0.6);

  client.after(3000, function() {
    log('copter stopped');
    this.stop();
  })
}

function flyDown() {
  client.down(0.6);

  client.after(3000, function() {
    log('copter stopped');
    this.stop();
  });
}

// should be require("dronestream").listen(server);
require("../index").listen(server);
server.listen(3000);

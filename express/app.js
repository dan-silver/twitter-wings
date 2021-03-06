/**
 *  This file contains the main logic for controlling the drone based
 *  off of tweets.
 */

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
  , program = require('commander');

var safeHandles = ["sgjkbd"]//, "michael_hagar"]

program
  .version('0.0.1')
  .option('-s, --safeMode', 'Safe mode')
  .parse(process.argv);

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
j
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
commands = [
            {
              command:"stop",
              callback: stop
            },
            {
              command:"up",
              callback: flyUp
            },
            {
              command:"down",
              callback: flyDown
            },
            {
              command:"flip",
              callback: flip
            },
            {
              command:"land",
              callback: land
            },
            {
              command:"takeoff",
              callback: takeOff
            }
          ]

var votes = [];

function resetVotes() {
  votes = []
  for (var i = 0;i<commands.length;i++) {
    votes.push(0);
  }
}

resetVotes()

io.on('connection', function (socket) {
  log('got connection');
  stream.on('tweet', function (tweet, error) {
    //make sure tweet is from a safe handle, otherwise don't continue!
    if (program.safeMode) {
      console.log("Running program in safe mode")
      var isFound = safeHandles.indexOf(tweet.user["screen_name"])
      console.log("comparing " + tweet.user["screen_name"] + " in " + safeHandles)
      console.log("is found=" + isFound)
      if (isFound == -1) {//not found
        return;
      }
    }

    twt = {};
    twt["screen_name"] = tweet.user["screen_name"];
    for (var i = 0;i<commands.length;i++) {
      if (tweet.text.search("#" + commands[i].command) != -1) {
        // log("voted " + commands[i].command + "!");
        votes[i]++;
        twt["command"] = commands[i].command;
        socket.emit("twt", twt);
      }
    }
  });
  // get the majority voted command every 5 seconds
  setInterval(function() {
    majorityCommandIndex = 0;
    for (var i = 0;i<votes.length;i++) {
      // log("command"+i+" votes=" + votes[i]);
      if (votes[i] > votes[majorityCommandIndex]) {
        majorityCommandIndex = i;
      } 
    }
    majorityCommand = commands[majorityCommandIndex]
    // log("best vote was " + majorityCommand.command);
    // Actually tell the copter to perform the command 
    majorityCommand.callback();
    resetVotes()
  }, 5000);
});

function flip() {
  client.animate('flipLeft', 3000);
}

function takeOff() {
  client.takeoff()
}

function stop() {
  client.stop()
}

function land() {
  client.land()
}

function flyUp() {
  client.up(0.4);

  client.after(1000, function() {
    log('copter stopped');
    this.stop();
  })
}

function flyDown() {
  client.down(1);

  client.after(1000, function() {
    log('copter stopped');
    this.stop();
  });
}

// should be require("dronestream").listen(server);
require("../index").listen(server);
server.listen(3000);

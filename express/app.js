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
})

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
  console.log("node>" + s)
}
app.post('/image', function(req, res, next) {
  log('image posted!')
    var result = {}
    var matches = req.body.picture.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/),response = {};
    result.type = matches[1];
    result.data = new Buffer(matches[2], 'base64');
    if (!result.data) {res.end()}
    require('fs').writeFile('../test_images/box_scene.'+result.type, result.data, "binary", function(err){
      if (err) throw err;
      image_rec = childProcess.exec('python ../image_rec.py', function (error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
         } else {
           console.log('Child Process STDOUT: '+stdout);
           console.log('Child Process STDERR: '+stderr);
           result = parseInt(stdout);
           log("There were " + result + " matches.")
         }
       });
       image_rec.on('exit', function (code) {
         console.log('Child process exited with exit code '+code);
       });
    });
  res.end()
})

app.get('/test-drone', function(req, res) {
  client.takeoff();

  client.after(5000, function() {
    this.land()
  });

  res.end()
})

var stream = T.stream('statuses/filter', { track: 'cernercopter' })

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  console.log('here')
  stream.on('tweet', function (tweet, error) {
    // console.log(tweet.text)
    socket.emit("tweet", tweet)
    if (tweet.text.search("#up") != -1) {
      console.log("going up!")
      client.takeoff();
    } else if (tweet.text.search("#down") != -1) {
      console.log("going down!")
      client.land();
    } else if (tweet.text.search("#blink") != -1) {
      console.log("blink!")
      client.animateLeds('blinkRed', 5, 2)
    } else if (tweet.text.search("#left") != -1) {
      console.log("left")
      client.counterClockwise(0.5)
    }
  })
});
// should be require("dronestream").listen(server);
// require("../index").listen(server);
server.listen(3000);

var express = require('express')
  , routes = require('./routes')
  , app = express()

  , path = require('path')
  , server = require("http").createServer(app)
  ;
var fs = require("fs");
var bodyParser = require('body-parser');

  var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var asyncblock = require('asyncblock');
var exec = require('child_process').exec;

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

app.get('/test', function(req, res){
  // The form's action is '/' and its method is 'POST',
  // so the `app.post('/', ...` route will receive the
  // result of our form
  var html = '<form action="/image" method="post">' +
               'Enter your name:' +
               '<input type="text" name="userName" placeholder="..." />' +
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
               
  res.send(html);
});

app.post('/image', function(req, res, next) {
  console.log('image posted!')
  // console.log(req)
  console.log(req.params)
  console.log(req.body.picture)
  console.log(req.picture)
  console.log(req.query)
  // console.log(req.query.picture)

     var result = {
        "type":"",
        "data":""
    }

    var matches = req.body.picture.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/),response = {};
    result.type = matches[1];
    result.data = new Buffer(matches[2], 'base64');

    require('fs').writeFile('../test_images/box_scene.'+result.type, result.data, "binary", function(err){
        // res.status(500).send("error");
      if (err) throw err;
      asyncblock(function (flow) {
          exec('python ../image_rec.py', flow.add());
          result = flow.wait();
          console.log("node> There were " + parseInt(result) + " matches.")
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


// should be require("dronestream").listen(server);
require("../index").listen(server);
server.listen(3000);

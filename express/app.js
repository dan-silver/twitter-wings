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


  // fs.writeFile("out.png", decodeBase64Image(req.body.picture), 'base64', function(err) {
  // });
  res.end()
})

app.get('/test-drone', function(req, res) {
  client.takeoff();

  client.after(5000, function() {
    this.land()
  });

  res.end()
})

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}


/*
 * Important:
 *
 * pass in the server object to listen, not the express app
 * call 'listen' on the server, not the express app
 */
// should be require("dronestream").listen(server);
require("../index").listen(server);
server.listen(3000);

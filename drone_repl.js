var Twit = require('twit')
    // config = require('./config')

// var T = new Twit({
//     consumer_key:         config.consumer_key
//   , consumer_secret:      config.consumer_key
//   , access_token:         config.access_token
//   , access_token_secret:  config.access_token_secret

// })

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

// var stream = T.stream('statuses/filter', { track: 'cernercopter' })

// stream.on('tweet', function (tweet) {
//   if (tweet.text.search("#up") != -1) {
//     console.log("going up!")
//     client.takeoff();
//   } else if (tweet.text.search("#down") != -1) {
//     console.log("going down!")
//     client.land();
//   } else if (tweet.text.search("#blink") != -1) {
//     console.log("blink!")
//     client.animateLeds('blinkRed', 5, 2)
//   } else if (tweet.text.search("#left") != -1) {
//     console.log("left")
//     client.counterClockwise(0.5)
//   }
// })


var video = client.getVideoStream();

video.on('data', console.log);
video.on('error', console.log);

// setTimeout(function() {
//   client.land();
// },1000*60)
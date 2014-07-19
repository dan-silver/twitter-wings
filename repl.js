var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
  .after(5000, function() {
    client.animate('yawDance', 1000);
  })
  .after(3000, function() {
    this.stop();
    this.land();
  });
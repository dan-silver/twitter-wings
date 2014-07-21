var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();
// client.calibrate(0)
// client.after(8*1000,function() {
//   this.land()
// })

//  ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
//    'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
//    'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
//    'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight']

client
  // .after(5000, function() {
    // this.up(0.7)
  // }).after(2000, function() {
      // this.stop();
      // console.log('flip!')
      // client.animate('flipRight', 1000); 
  // })
  .after(6*1000, function() {
    this.stop();
    this.land();
  });
var phonecatApp = angular.module('twitter-wings', []);

phonecatApp.controller('AppCtrl', function ($scope) {
  $scope.twts = [{screen_name: "dan Silver"}];

  var socket = io.connect('http://localhost');
  socket.on('twt', function (data) {
  	console.log(data)
    // keep a queue of ten tweets. If queue is greater than 10, then delete
    // keep a queue of ten twts. If queue is greater than 10, then delete
    // first element and enqueue the next element.
    if ($scope.twts.length > 10) {
      $scope.twts.shift();
    }
    $scope.twts.push(data)
    console.log(data);
    $scope.$apply()
  });
});

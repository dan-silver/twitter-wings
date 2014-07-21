var phonecatApp = angular.module('twitter-wings', []);

phonecatApp.controller('AppCtrl', function ($scope) {
  $scope.tweets = [];
  $scope.imageSuccess = false

  var socket = io.connect('http://localhost');
  socket.on('refreshImage', function (data) {
    if (data.success) {
      $("#compare").attr('src', "comparison.png?time=" + new Date());
      $scope.imageSuccess = true
    } else {
      $scope.imageSuccess = false
    }
    $scope.$apply();
  })

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
    //  write back to server
    //  socket.emit('my other event', { my: 'data' });
  });
});

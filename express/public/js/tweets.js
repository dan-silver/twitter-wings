var phonecatApp = angular.module('twitter-wings', []);

phonecatApp.controller('AppCtrl', function ($scope) {
  $scope.tweets = [];

  var socket = io.connect('http://localhost');
  socket.on('tweet', function (data) {
    // keep a queue of ten tweets. If queue is greater than 10, then delete
    // first element and enqueue the next element.
    if ($scope.tweets.length > 10) {
      $scope.tweets.shift();
    }
    $scope.tweets.push(data)
    console.log(data);
    $scope.$apply()
    //  write back to server
    //  socket.emit('my other event', { my: 'data' });
  });
});

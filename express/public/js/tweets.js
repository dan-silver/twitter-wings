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
  socket.on('tweet', function (data) {
    $scope.tweets.push(data)
    console.log(data);
    $scope.$apply()
    //  write back to server
    //  socket.emit('my other event', { my: 'data' });
  });
});
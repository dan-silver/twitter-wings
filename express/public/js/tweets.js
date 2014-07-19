var phonecatApp = angular.module('twitter-wings', []);

phonecatApp.controller('AppCtrl', function ($scope) {
  $scope.tweets = [];

  var socket = io.connect('http://localhost');
  socket.on('tweet', function (data) {
    //$scope.tweets.push(data)
    console.log(data);
    $scope.$apply()
    //  write back to server
    //  socket.emit('my other event', { my: 'data' });
  });
});
var walltrApp = angular.module('walltrApp', ['ngRoute', 'firebase']);

walltrApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/wall', {
      templateUrl: '/templates/wall.html',
      controller: 'WalltrCtrl'
    }).
    when('/login', {
      templateUrl: '/templates/login.html',
      controller: 'WalltrCtrl'
    }).
    otherwise({redirectTo: '/login'});
}]);

walltrApp.controller('WalltrCtrl', ['$location', '$scope', '$firebase', function($location, $scope, $firebase) {
  var walltrRef = new Firebase('https://walltr.firebaseio.com');
  var posts = $firebase(new Firebase('https://walltr.firebaseio.com/posts'));
  $scope.user = false;
  $scope.posts = [];

  var auth = new FirebaseSimpleLogin(walltrRef, function(error, user) {
    if (error) {
      alert('Such wrong');
    }
    else if (user) {
      $scope.user = user;
      $location.path('/wall');
    }
    else {
      $scope.user = false;
      $location.path('/login');
    }
  });

  if ($scope.user) {
    $location.path('/wall');
  }

  $scope.addPost = function(text) {
    var date = new Date();

    posts.$add({
      user: $scope.user.email,
      timestamp: date.getTime(),
      text: text,
      parent: false
    });
  };

  $scope.addComment = function(post, text) {
    var date = new Date();

    posts.$add({
      user: $scope.user.email,
      timestamp: date.getTime(),
      text: text,
      parent: post.id
    });
  };

  $scope.login = function(email, password) {
    auth.login('password', {
      email: email,
      password: password
    });
  };

  posts.$on('child_added', function(snapshot) {
    var post = snapshot.snapshot.value;

    if (!post.parent) {
      $scope.posts.push({
        id: snapshot.snapshot.name,
        user: post.user,
        timestamp: post.timestamp,
        text: post.text,
        children: []
      });
    }
    else {
      angular.forEach($scope.posts, function(value, key) {
        if (value.id == post.parent) {
          value.children.push({
            id: snapshot.snapshot.name,
            user: post.user,
            timestamp: post.timestamp,
            text: post.text,
            children: []
          });
        }
      });
    }
  });

}]);

var walltrApp = angular.module('walltrApp', ['ngRoute']);

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

walltrApp.controller('WalltrCtrl', ['$location', '$scope', function($location, $scope) {
  if (!window.currentUser) {
    $location.path('/login');
  }

  $scope.users = {
    olof: {
      name: 'Olof',
      email: 'olof.johansson@oddhill.se'
    },
    linus: {
      name: 'Linus',
      email: 'linus@linusbohman.se'
    },
    bjorn: {
      name: 'Björn',
      email: 'bjorn.albertsson@oddhill.se'
    },
    adam: {
      name: 'Adam',
      email: 'adam.gerthel@oddhill.se'
    }
  };

  $scope.posts = [];

  $scope.addPost = function(text) {
    var date = new Date();

    $scope.posts.push({
      user: window.currentUser,
      timestamp: date.getTime(),
      text: text,
      comments: []
    });
  };

  $scope.addComment = function(post, text) {
    var date = new Date();

    post.comments.push({
      user: window.currentUser,
      timestamp: date.getTime(),
      text: text
    });
  };

  $scope.login = function(name) {
    if (!$scope.users.hasOwnProperty(name)) {
      alert('Such wrong');
      return;
    }

    window.currentUser = name;
    $location.path('/wall');
  };

}]);

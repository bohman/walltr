var walltrApp = angular.module('walltrApp', ['ngRoute', 'firebase', 'ui.gravatar', 'ngSanitize']);

walltrApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/wall', {
      templateUrl: '/templates/wall.html',
      controller: 'WalltrCtrl'
    }).
    when('/login', {
      templateUrl: '/templates/login.html',
      controller: 'LoginCtrl'
    }).
    otherwise({redirectTo: '/login'});
}]);

walltrApp.controller('LoginCtrl', ['$location', '$scope', '$firebase', '$firebaseSimpleLogin', '$rootScope', function($location, $scope, $firebase, $firebaseSimpleLogin, $rootScope) {
  $scope.auth = $firebaseSimpleLogin(new Firebase('https://walltr.firebaseio.com'));

  $rootScope.$on('$firebaseSimpleLogin:login', function(error, user) {
    $location.path('/wall');
  });

  $scope.login = function(email, password) {
    $scope.auth.$login('password', {
      email: email,
      password: password
    }).then(function(user) {
      $location.path('/wall');
    }, function(error) {
      alert('So wrong');
    });
  };

}]);

walltrApp.controller('WalltrCtrl', ['$location', '$scope', '$firebase', '$firebaseSimpleLogin', '$rootScope', function($location, $scope, $firebase, $firebaseSimpleLogin, $rootScope) {
  $scope.auth = $firebaseSimpleLogin(new Firebase('https://walltr.firebaseio.com'));

  $rootScope.$on('$firebaseSimpleLogin:logout', function(error, user) {
    $location.path('/login');
  });

  $rootScope.$on('$firebaseSimpleLogin:login', function(error, user) {
    var walls = $firebase(new Firebase('https://walltr.firebaseio.com/walls'));
    var posts = $firebase(new Firebase('https://walltr.firebaseio.com/posts'));
    $scope.posts = [];
    $scope.walls = [];
    $scope.currentWall = false;
    $scope.users = {
      'olof.johansson@me.com': 'Olof Johansson',
      'bjorn.albertsson@gmail.com': 'Björn Albertsson',
      'linus@linusbohman.se': 'Linus Bohman',
      'insats@gmail.com': 'Adam Gerthel'
    };

    $scope.addWall = function(name) {
      if (!name) {
        return;
      }

      walls.$add(name);
      $scope.newWall = '';
    }

    walls.$on('loaded', function() {
      angular.forEach(walls, function(value, key) {
        if (typeof value == 'string' && key != '$id') {
          $scope.walls.push({
            id: key,
            name: value
          });
        }
      });

      if ($scope.walls[0]) {
        $scope.currentWall = {
          id: $scope.walls[0].id,
          name: $scope.walls[0].name
        };
      }
    });

    walls.$on('child_added', function(snapshot) {
      $scope.walls.push({
        id: snapshot.snapshot.name,
        name: snapshot.snapshot.value
      });

      if (!$scope.currentWall) {
        $scope.currentWall = {
          id: snapshot.snapshot.name,
          name: snapshot.snapshot.value
        };
      }
    });

    walls.$on('child_removed', function(snapshot) {
      angular.forEach($scope.walls, function(value, key) {
        if (value.id == snapshot.snapshot.name) {
          $scope.walls.splice(key, 1);
        }
      });
    });

    $scope.addPost = function(text) {
      if (!text) {
        return;
      }
      var date = new Date();

      posts.$add({
        user: $scope.auth.user.email,
        timestamp: date.getTime(),
        text: text,
        parent: false
      });

      $scope.text = '';
    };

    $scope.addComment = function(post, comment) {
      if (!comment) {
        return;
      }
      var date = new Date();

      posts.$add({
        user: $scope.auth.user.email,
        timestamp: date.getTime(),
        text: comment,
        parent: post.id
      });

      post.newComment = '';
    };

    posts.$on('loaded', function() {
      angular.forEach(posts, function(value, key) {
        if (typeof value == 'object') {
          var post = value;
          var id = key;

          if (!post.parent) {
            $scope.posts.push({
              id: id,
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
                  id: id,
                  user: post.user,
                  timestamp: post.timestamp,
                  text: post.text ? post.text : '',
                  children: []
                });
              }
            });
          }
        }
      });
    });

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
              text: post.text ? post.text : '',
              children: []
            });
          }
        });
      }
    });

    posts.$on('child_removed', function(snapshot) {
      var removedPost = snapshot.snapshot.value;

      if (!removedPost.parent) {
        angular.forEach($scope.posts, function(post, key) {
          if (post.id == snapshot.snapshot.name) {
            $scope.posts.splice(key, 1);
          }
        });
      }
      else {
        angular.forEach($scope.posts, function(post, key) {
          if (post.id == removedPost.parent) {
            angular.forEach(post.children, function(child, key) {
              if (child.id == snapshot.snapshot.name) {
                post.children.splice(key, 1);
              }
            });
          }
        });
      }
    });
  });

  $scope.showWalls = false;
  $scope.toggleWalls = function() {
    if ($scope.showWalls) {
      $scope.showWalls = false;
    }
    else {
      $scope.showWalls = true;
    }
  };

}]);

walltrApp.filter('timeago', function(){
  return function(date){
    return moment(date).fromNow();
  };
});

walltrApp.filter('newlines', function () {
  return function(text) {
    return text.replace(/\n/g, '<br />');
  }
})

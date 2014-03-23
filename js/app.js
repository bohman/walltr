var walltrApp = angular.module('walltrApp', ['ngRoute', 'firebase', 'ui.gravatar', 'ngSanitize']);

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

walltrApp.controller('WalltrCtrl', ['$location', '$scope', '$firebase', '$firebaseSimpleLogin', function($location, $scope, $firebase, $firebaseSimpleLogin) {
  $scope.auth = $firebaseSimpleLogin(new Firebase('https://walltr.firebaseio.com'));
  var posts = $firebase(new Firebase('https://walltr.firebaseio.com/posts'));
  $scope.users = {
    'olof.johansson@me.com': 'Olof Johansson',
    'bjorn.albertsson@gmail.com': 'Björn Albertsson',
    'linus@linusbohman.se': 'Linus Bohman',
    'insats@gmail.com': 'Adam Gerthel'
  };
  $scope.posts = [];

  $scope.addPost = function(text) {
    var date = new Date();

    posts.$add({
      user: $scope.auth.user.email,
      timestamp: date.getTime(),
      text: text,
      parent: false
    });
  };

  $scope.addComment = function(post, text) {
    var date = new Date();

    posts.$add({
      user: $scope.auth.user.email,
      timestamp: date.getTime(),
      text: text,
      parent: post.id
    });
  };

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

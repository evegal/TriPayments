// LOGIN CTRL 
app.controller('loginCtrl', ['$scope', '$location', 'authService', 'appLogo', function ($scope, $location, authService, appLogo) {

    $scope.logoName = appLogo;

    $scope.loginData = {
        userName: "",
        password: "",
        useRefreshTokens: false,
        origin: $location.$$host
    };

    $scope.login = function() {
        authService.login($scope.loginData).then(function (response) {
            $location.path('/search');
        },
         function(err) {
             $scope.message = err.error_description;
         });
    };



}]); // END LOGIN CTRL
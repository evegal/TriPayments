/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. loginCtrl
  
 **  *************************************** **/

// LOGIN CTRL 
app.controller('loginCtrl', ['$scope', '$location', 'authService', 'appLogo', function ($scope, $location, authService, appLogo) {

    $scope.logoName = appLogo;
    $scope.date = new Date();

    $scope.loginData = {
        userName: "",
        password: "",
        useRefreshTokens: true,
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
// RESET PASSWORD
app.controller('resetCtrl', function($scope,$http,$rootScope,$location,$timeout,baseUrl) {
    
    $scope.resetForm = {};

    $scope.submit = function() {

        if($scope.resetForm.$valid) {
            
            $rootScope.resetEmail = $scope.resetForm.Email;

            var userEmail = $scope.resetForm.Email;
            var Url = baseUrl + 'users/' + userEmail + '/forgotPassword';

            // GET REQUEST TO RESET PASSWORD
            $http.get(Url).success(function(data,status) {

                $scope.message = data;

                if(data.length === 17) {
                    console.log('user not found');
                } else {
                    $location.path('/reset_email');
                }

                //$location.path('/reset_email');
                          

            }).error(function(data) {
                //$scope.message = 'Email Not Found';
            });

        } else {
            $('.error').slideDown(300);

            $timeout(function() {
                $('.error').slideUp(300);
            },1000);

        } 
        
        


    }; // END submit

});
/////////////////
// RESET EMAIL
/////////////////
app.controller('resetEmailCtrl', function($scope,$rootScope) {

    $scope.subEmail = $rootScope.resetEmail;

});
///////////////////
// RESET PASSWORD
///////////////////
app.controller('resetPasswordCtrl', function($scope,$location,$http,$timeout,baseUrl) {
    /*
    var userObject = $location.search();
    var bucket = [];
    
    for(var i in userObject) {
        bucket.push(userObject[i]);

    }
    
    // SETUP NEW CLEAN OBJ
    var cleanObject = {

    };
    */
    $scope.tempObj = $location.search();
    $scope.userEmail = $scope.tempObj.email;
    $scope.userToken = $scope.tempObj.token;
    $scope.userName = $scope.tempObj.username;
    
    $scope.passwordForm = {};

    $scope.submit = function() {

        if($scope.passwordForm.$valid) {

            console.log('all good');
            
            var passQuery =  {
                "EmailAddress":$scope.userEmail,
                "NewPassword":$scope.user.newPass,
                "ResetToken":$scope.userToken
            };

            console.log(passQuery);
            
            if($scope.user.newPass === $scope.user.confirmPass) {
                console.log('passwords match');
                // SEND POST
                $http({
                    method:'POST',
                    url: baseUrl + 'users/resetPassword',
                    data:passQuery
                }).success(function(data,status) {
                    console.log('password updated');
                    console.log(status);

                    $location.path('/reset_success');
                });

            } else {
                console.log('they dont match');

                $('.user_help_pass').slideDown(300);

                $timeout(function() {
                    $('.user_help_pass').slideUp(300);
                },1000);
            }

        } else {
            console.log('all bad');
            $('.user_help').slideDown(300);

            $timeout(function() {
                $('.user_help').slideUp(300);
            },1000);
        }

        
        
    }; // END submit


}); // END resetPasswordCtrl

//////////////////////////
// RESET PASSWORD SUCCESS
//////////////////////////
app.controller('resetSuccessCtrl', function($scope,$location) {

    $scope.backToLogin = function() {
        $location.path('/login');
    };

});

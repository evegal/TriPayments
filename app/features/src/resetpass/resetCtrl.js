/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. resetCtrl
   02. resetEmailCtrl
   03. resetPasswordCtrl
   04. resetSuccessCtrl
  
 **  *************************************** **/


// RESET PASSWORD
app.controller('resetCtrl', function($scope,$http,$rootScope,$location,$timeout,baseUrl,appLogo) {
    
    $scope.logoName = appLogo;
    $scope.resetForm = {};
    $scope.date = new Date();

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
});  // END resetCtrl

// RESET EMAIL
app.controller('resetEmailCtrl', function($scope,$rootScope,appLogo) {

    $scope.logoName = appLogo;
    $scope.subEmail = $rootScope.resetEmail;
    $scope.date = new Date();
}); //END resetEmailCtrl

// RESET PASSWORD
app.controller('resetPasswordCtrl', function($scope,$location,$http,$timeout,baseUrl,appLogo) {
    $scope.logoName = appLogo;
    $scope.date = new Date();

    $scope.tempObj = $location.search();
    $scope.userEmail = $scope.tempObj.email;
    $scope.userToken = $scope.tempObj.token;
    $scope.userName = $scope.tempObj.username;
    
    $scope.passwordForm = {};

    $scope.submit = function() {

        if($scope.passwordForm.$valid) {

            var passQuery =  {
                "EmailAddress":$scope.userEmail,
                "NewPassword":$scope.user.newPass,
                "ResetToken":$scope.userToken
            };
           
            if($scope.user.newPass === $scope.user.confirmPass) {
                // SEND POST
                $http({
                    method:'POST',
                    url: baseUrl + 'users/resetPassword',
                    data:passQuery
                }).success(function(data,status) {
                    
                    if(data.Success == false){
                        //SOMETHING 
                        $scope.errorMsg = data.Errors[0];
                        $('.user_help').slideDown(500);
                        $timeout(function() {
                            $('.user_help').slideUp(500);
                        },5000);
                    } else {
                        console.log('password updated');
                        $location.path('/reset_success');
                    }

                }).error(function(data, status) {
                        
                    //SOMETHING ERRONEOUS WITH THE API
                    $scope.errorMsg = 'Passwords must be at least 8 characters, minimum of one digit, minimum of one uppercase.';
                    $('.user_help').slideDown(500);
                    $timeout(function() {
                        $('.user_help').slideUp(500);
                    },3000);
                });

            } else {
    
                //PASSWORD FIELDS NOT COMPLETED
                $scope.errorMsg = 'Passwords do not match. Please Try again';
                $('.user_help').slideDown(500);
                $timeout(function() {
                    $('.user_help').slideUp(500);
                },3000);            

                $scope.user.newPass = '';
                $scope.user.confirmPass = '';
            }

        } else {

            //PASSWORD FIELDS NOT COMPLETED
            $scope.errorMsg = 'Please ensure to complete all fields (*).';
            $('.user_help').slideDown(500);
            $timeout(function() {
                $('.user_help').slideUp(500);
            },3000);

        }


    }; // END submit
}); // END resetPasswordCtrl


// RESET PASSWORD SUCCESS
app.controller('resetSuccessCtrl', function($scope,$location,appLogo) {

    $scope.logoName = appLogo; 

    $scope.backToLogin = function() {
        $location.path('/login');
    };

}); // END resetSuccessCtrl

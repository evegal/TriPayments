/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. usermanagerCtrl
   02. createUserModalCtrl
   03. removeUserModalCtrl
   04. editUserModalCtrl
  
 **  *************************************** **/

app.controller('usermanagerCtrl', function($scope,$http,$state,baseUrl,$rootScope,Notify) {

  // LOAD USERS
  $http.get(baseUrl + 'users').success(function(data) {
    $scope.Users = data;
    $scope.shownUsers = $scope.Users;

    // CSV Export
    $scope.usersCSV = $scope.shownUsers;
  });

  // NOTIFY NEW USER
  Notify.getMsg('NewUser', function(event,data) {
    $http.get(baseUrl + 'users').success(function(data) {
       $scope.Users = data;
    });

  });

  // NOTIFY DELETE USER
  Notify.getMsg('RemoveUser', function(event,data) {
    $http.get(baseUrl + 'users').success(function(data) {
       $scope.Users = data;
    });

  });
  
  // NOTIFY EDIT USER
  Notify.getMsg('UpdateUser', function(event,data) {
    $http.get(baseUrl + 'users').success(function(data) {
       $scope.Users = data;
    });

  });
}); // end usermanagerCtrl

app.controller('createUserModalCtrl', function($scope,$modal,$log) {
  $scope.open = function() {
     var modalInstance = $modal.open({
        templateUrl:'userModalContent.html',
        controller:userCreateInstanceCtrl,
        size:'lg'
     });
  }
});

var userCreateInstanceCtrl = function($scope,$modalInstance,$http,$timeout,$rootScope,Notify,baseUrl) {

    $scope.cancel = function() {
       $modalInstance.close();
    }

    $scope.createUser = function(theForm) {

      if(theForm.$valid) {

          // VERIFY PASSWORDS MATCH
          if(document.getElementById('newUserPwInitial').value == document.getElementById('newUserPwRepeat').value) {
            var Query = {
              "Username":document.getElementById('newUserName').value,
              "Password":document.getElementById('newUserPwInitial').value,
              "Email":document.getElementById('newUserEmail').value,
            }

            $http({
              method:'POST',
              url:baseUrl + 'users',
              data:Query
            }).success(function(data,status) {

              if(data.Success) {

                Notify.sendMsg('NewUser', {'id':data.id});

                $('.userCreateSuccess').show();

                $timeout(function() {
                  $modalInstance.close();
                },2000);

              } else {
                // PASSWORDS DO NOT MATCH
                $scope.errorMsg = data.Errors[0];

                $('.errorMsg').slideDown(500);
                $timeout(function() {
                    $('.errorMsg').slideUp(500);
                },3000); 
              }

            }).error(function(data, status) {
                        
                //SOMETHING ERRONEOUS WITH THE API
                $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                $('.errorMsg').slideDown(500);
                $timeout(function() {
                    $('.errorMsg').slideUp(500);
                },3000);    
            });

          } else {

            // PASSWORDS DO NOT MATCH
            $scope.errorMsg = 'Passwords do not match.';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000); 
          }



      } else {

          // FORM NOT PROPERLY FILLED
          $scope.errorMsg = 'Please complete all required input fields.';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

      }

    }
  
} // end userCreateInstanceCtrl

// USER REMOVE
app.controller('removeUserModalCtrl', function($scope,$modal,$log) {
  $scope.open = function(user) {
     var modalInstance = $modal.open({
      templateUrl:'userRemoveContent.html',
      controller:userRemoveInstanceCtrl,
      size:'lg',
      resolve: {
        user:function() {
           return user;
        }
      }
     });
  }
});

var userRemoveInstanceCtrl  = function($scope,$modalInstance,$http,$timeout,user,baseUrl,Notify) {

   $scope.user = user;
   $scope.userId = user.UserId;

   console.log($scope.userId);

   $scope.cancel = function() {
      $modalInstance.close();
   }

   $scope.removeUser = function() {

      
     $http({
        method:'DELETE',
        url: baseUrl + 'users/' + $scope.userId
     }).success(function(data,status) {
        
        Notify.sendMsg('RemoveUser', {'id':data.id});
        $('.userCreateSuccess').show();

        $timeout(function() {
          $modalInstance.close();
        },500);

     }).error(function(data, status) {
                        
        //SOMETHING ERRONEOUS WITH THE API
        $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);    

      });

   }
} // END userRemoveInstanceCtrl

// editUserModalCtrl
app.controller('editUserModalCtrl', function($scope,$modal,$log) {
  $scope.open = function(user) {
     var modalInstance = $modal.open({
      templateUrl:'userEditContent.html',
      controller:userEditInstanceCtrl,
      size:'lg',
      resolve: {
        user:function() {
           return user;
        }
      }
     });
  }
});

var userEditInstanceCtrl = function($scope,$modalInstance,$http,$timeout,Notify,user,baseUrl) {

  $scope.original = user;
  $scope.copyCat = angular.copy(user);
  $scope.user = $scope.copyCat;

  $scope.cancel = function() {
      $scope.user = $scope.original;
      $modalInstance.close();
    }

    $scope.updateUser = function(user) {

      var updateQuery = {
        "Password":$scope.user.Password,
        "Email":$scope.user.Email
      }

      $http({
        method:'PUT',
        url: baseUrl + 'users/' + user.UserId,
        data:updateQuery
      }).success(function(status,data) {

        Notify.sendMsg('UpdateUser');
        $('.userCreateSuccess').show();

        $timeout(function() {
          $modalInstance.close();
        },500);
      
      }).error(function(data, status) {
                        
        //SOMETHING ERRONEOUS WITH THE API
        $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000); 

      });

    } 
    
} // END userEditInstanceCtrl
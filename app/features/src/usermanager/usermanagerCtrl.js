app.controller('usermanagerCtrl', function($scope,$http,$state,baseUrl,$rootScope,Notify) {
///////////////////
// LOAD USERS
///////////////////
$http.get(baseUrl + 'users').success(function(data) {
  $scope.Users = data;
  $scope.shownUsers = $scope.Users;

  //console.log(data);
  
  // CSV Export
  $scope.usersCSV = data;
});

  ///////////////////
  // NOTIFY NEW USER
  ///////////////////
  Notify.getMsg('NewUser', function(event,data) {
    
    $http.get(baseUrl + 'users').success(function(data) {
       $scope.Users = data;
    });

  });
  //////////////////////
  // NOTIFY DELETE USER
  //////////////////////
  Notify.getMsg('RemoveUser', function(event,data) {

    $http.get(baseUrl + 'users').success(function(data) {
       $scope.Users = data;
    });

  });
  
 
  $scope.saveUser = function(data,id) {

    if(id) {
      console.log('saving');
      angular.extend(data, {id:id});
          return $http.put( baseUrl + 'users/' + id, data);
          console.log('user information updated');
      } else {
        angular.extend(data, {id:id});
          return $http.post( baseUrl + 'users', data);
          console.log('user created');

      }
      
  }

}); // end usermanagerCtrl



// MODALS
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


    $scope.ok = function() {

      if(document.getElementById('username').value === '') {
        console.log('name empty');
        $('.nameError').slideDown(300);

        $scope.createErrorMsg = 'Please Enter A User Name';
        // hide error messages
        $timeout(function() {
          $('.nameError').slideUp(300);
        },1500);
      } else if(document.getElementById('email').value === '') {
        $('.nameError').slideDown(300);

        $scope.createErrorMsg = 'Please Enter An Email';
        $timeout(function() {
          $('.nameError').slideUp(300);
        },1500);
      } else if (document.getElementById('password').value === '' || document.getElementById('repeatpassword').value === '') {
        $('.nameError').slideDown(300);

        $scope.createErrorMsg = 'Please Create & Repeat Password';
        $timeout(function() {
          $('.nameError').slideUp(300);
        },1500);
      }  else {

        var emailInput = document.getElementById('email').value;

        var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        if(regex.test(emailInput) === false) {
           $('.nameError').slideDown(300);

           console.log(regex.test(emailInput));

           $scope.createErrorMsg = 'Invalid Email';
           $timeout(function() {
              $('.nameError').slideUp(300);
            },1500);
        } else {
          console.log('checking passwords');

        var primePassword = document.getElementById('password').value;
        var secondPassword = document.getElementById('repeatpassword').value;

        if(primePassword === secondPassword) {
           $('.user_feedback').slideDown(300);
           $('.create_btn').remove();
           $('.save_btn').show();
        } else {
          $('.nameError').slideDown(300);

          $scope.createErrorMsg = 'Passwords Do Not Match';
          $timeout(function() {
              $('.nameError').slideUp(300);
            },1500);
        }


        }
        
      }

    }
  
  
  //$scope.userCreateForm = {};    
  // SAVE USER
    $scope.submit = function() {

    console.log('user created');
    
    var userDetails = {
      "Username": document.getElementById('username').value,
      "Password": document.getElementById('password').value,
      "Email": document.getElementById('email').value,
      "TriPaymentsApiCompanyId":4
    }

    // Updated Displayed Users
    //$scope.Users.push(userDetails);
    
    // POST REQUEST
    
    var promise = $http({
      method:'POST',
      url: baseUrl + 'users',
      data:userDetails
    });

    // UPDATE UI
    //$rootScope.displayedUsers.push(userDetails);

    promise.success(function(data) {
      
      Notify.sendMsg('NewUser', {'id':data.id});

      console.log('user created');

      $('.user_feedback').hide();
      $('.userCreateSuccess').show();
      $('.userError').hide();
      $scope.userCreateSuccess = 'User Created';

      $timeout(function() {
        $modalInstance.close();
      },2000);

    }).error(function(data,status) {
      console.log(data,status);

      $('.userError').show();

      $timeout(function() {
        $('.userError').slideUp(300);
      });
    });
    
    
  } // END SUBMIT saveUser

} // end userCreateInstanceCtrl


//////////////////////
//// USER REMOVE
//////////////////////
app.controller('removeUserModalCtrl', function($scope,$modal,$log) {
  $scope.openIt = function(user) {
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

var userRemoveInstanceCtrl = function($scope,$modalInstance,$http,$timeout,user,baseUrl,$rootScope,UserService,Notify,baseUrl) {
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

      // NOTIFY SERVICE
      Notify.sendMsg('RemoveUser', {'id':data.id});

        console.log(status);

        $('.userCreateSuccess').show();

        $timeout(function() {
          $modalInstance.close();
        },500);
     });

   }
}
//////////////////////
//// USER EDIT
//////////////////////
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

var userEditInstanceCtrl = function($scope,$modalInstance,$http,$timeout,user,baseUrl) {

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

      console.log(updateQuery);

      $http({
        method:'PUT',
        url: baseUrl + 'users/' + user.UserId,
        data:updateQuery
      }).success(function(status,data) {
        console.log(status + ' ' + data);
      });

    } // END updateUser

}
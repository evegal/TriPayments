app.controller("appCtrl", function($rootScope,$scope,$state,$timeout,$http,baseUrl,Notify,appLogo) {

  $scope.logoName = appLogo; 
  
  $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");      
  });
  

  ///////////////////
  // LOAD MIDGROUPS
  ///////////////////
  $rootScope.modalGroups = [];


    $http.get(baseUrl + 'midgroups').success(function(data) {

      $scope.groupsBulk = data;
      $scope.groupAmount = data.length;

      // CSV Export
      $scope.groupCSV = data;
      // copy the references
      //$scope.shownMerchants = [].concat($scope.groupsBulk);

      angular.forEach(data, function(value,key) {
         $rootScope.modalGroups.push(value);
      }); 

  });




  //////////////////////
  // NOTIFY ADD MERCHANT
  //////////////////////
  Notify.getMsg('NewMerchant', function(event,data) {
    $scope.groupsBulk.push(data);
  });

   //////////////////////
  // NOTIFY EDIT MERCHANT
  //////////////////////
  Notify.getMsg('MerchantUpdated', function(event,data) {

    $http.get(baseUrl + 'midgroups').success(function(data) {
      $scope.groupsBulk = data;
    });

  });

  ///////////////////
  // LOAD CURRENCIES
  ///////////////////
 
  $http.get(baseUrl + 'currencies').success(function(data) {
      $scope.currencies = data;
  });


  ///////////////////
  // LOAD GATEWAYS
  ///////////////////
  $rootScope.gateways = [];

  $http.get(baseUrl + 'gateways').success(function(data) {
    
    $scope.gateways = data; 
    
    angular.forEach(data, function(value,key) {
            $rootScope.gateways.push(value);
    });
      
  });


  ///////////////////
  // LOAD MIDS
  ////////////////////

  $http.get(baseUrl + 'mids').success(function(data) {

    //console.log(data);
    
    $scope.mids = data;
    $scope.shownMids = $scope.mids;
    $scope.dataLen = data.length;

    $scope.clients = data;

    // FORMAT GROUPS FOR POPOVER DISPLAY
    $scope.groupNames = [];


    for(var i=0;i<data.length;i++) {
       //console.log(data[i].GroupMembership);
       $scope.groupNames.push(data[i].GroupMembership);

    }

    ////////////////////
    //    CSV EXPORT
    ////////////////////
    $scope.midsCSV = data;


    ////////////////////
    //    REMOVE MID
    ////////////////////
    Notify.getMsg('removedMid', function(event,index) {

        $http.get(baseUrl + 'mids').success(function(data) {
            $scope.mids = data;
            $scope.shownMids = $scope.mids;
            $scope.dataLen = data.length;
        });

        //console.log('view should update');

    });


    ////////////////////
    //    DISABLE MID
    ////////////////////
    Notify.getMsg('DeleteMid', function(event,index) {
        
        $scope.shownMids.splice(index,1);

        $http.get(baseUrl + 'mids').success(function(data) {
            $scope.mids = data;
            $scope.shownMids = $scope.mids;
            $scope.dataLen = data.length;
        });

    });



    ////////////////////
    //    NEW MID
    ////////////////////
    Notify.getMsg('NewMidUpdate', function(event,data) {

        $http.get(baseUrl + 'mids').success(function(data) {
            $scope.mids = data;
            $scope.shownMids = $scope.mids;
            $scope.dataLen = data.length;
        });

    });

  }); // END GET

  
  //////////////////////////
  // NOTIFY DELETE MERCHANT
  //////////////////////////
  Notify.getMsg('RemoveMerchant', function(event,data) {
    $scope.groupsBulk.splice(data,1);
  });



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


  ////////////
  // SIDENAV
  ////////////
  $scope.isCollapsed = true;

  var currentState = $state.current.name;

  //console.log(currentState);

  if(currentState === 'app.merchants.mids') {
    $scope.isCollapsed = false;
  }

  if(currentState === 'app.merchants.groups') {
    $scope.isCollapsed = false;
  }
  
  $scope.checkState = function() {
    $timeout(function() {
      var curState = $state.$current.name;

      //console.log(curState);
      if(curState === 'app.merchants.mids') {
         $scope.isCollapsed = false;
      } else if(curState === 'app.search' || 'app.usermananger' || 'app.virtual_terminal') {
         $scope.isCollapsed = true;
      }

    },100);
  }
  
   

   $scope.noteState1 = function() {
      return $state.current.name + 'daddy';
   }

   $scope.noteState2 = function() {
      return $state.current.name + 'mids';
   }

   $scope.noteState3 = function() {
      return $state.current.name + 'groups';
   }

   $scope.setDefault = function() {
      $state.go('app.merchants.mids');
   }
});

////////////////
// INDEX CTRL
////////////////
app.controller('indexCtrl', ['$scope', '$location', 'authService','$http','baseUrl', function ($scope, $location, authService,$http) {
 
    $scope.logOut = function () {
        authService.logOut();
        $location.path('/login');
    }
 
    $scope.authentication = authService.authentication;
    
}]); // end indexCtrl
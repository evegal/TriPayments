app.controller("appCtrl", function($rootScope,$scope,$state,$timeout,$http,baseUrl,Notify,appLogo) {

  $scope.logoName = appLogo; 

  //COUNTRIES FOR APPLICATION
  $rootScope.countries = [
      {Id:"US",Country:"United States"},
      {Id:"CA",Country:"Canada"},
      {Id:"IE",Country:"Ireland"},
      {Id:"UK",Country:"United Kingdom"},
      {Id:"AS",Country:"American Samoa"},
      {Id:"AU",Country:"Australia"},
      {Id:"AT",Country:"Austria"},
      {Id:"BS",Country:"Bahamas"},
      {Id:"BE",Country:"Belgium"},
      {Id:"BM",Country:"Bermuda"},
      {Id:"BO",Country:"Bolivia, Plurinational State Of"},
      {Id:"BA",Country:"Bosnia and Herzegovina"},
      {Id:"BR",Country:"Brazil"},
      {Id:"BF",Country:"Burkina Faso"},
      {Id:"KH",Country:"Cambodia"},
      {Id:"IC",Country:"Canary Islands"},
      {Id:"CL",Country:"Chile"},
      {Id:"CN",Country:"China"},
      {Id:"CR",Country:"Costa Rica"},
      {Id:"HR",Country:"Croatia"},
      {Id:"CY",Country:"Cyprus"},
      {Id:"CZ",Country:"Czech Republic"},
      {Id:"DK",Country:"Denmark"},
      {Id:"EC",Country:"Ecuador"},
      {Id:"EG",Country:"Egypt"},
      {Id:"SV",Country:"El Salvador"},
      {Id:"EE",Country:"Estonia"},
      {Id:"FI",Country:"Finland"},
      {Id:"FR",Country:"France"},
      {Id:"DE",Country:"Germany"},
      {Id:"GI",Country:"Gibraltar"},
      {Id:"GR",Country:"Greece"},
      {Id:"GL",Country:"Greenland"},
      {Id:"GU",Country:"Guam"},
      {Id:"GT",Country:"Guatemala"},
      {Id:"HK",Country:"Hong Kong"},
      {Id:"HU",Country:"Hungary"},
      {Id:"IS",Country:"Iceland"},
      {Id:"IN",Country:"India"},
      {Id:"IL",Country:"Israel"},
      {Id:"IT",Country:"Italy"},
      {Id:"JM",Country:"Jamaica"},
      {Id:"JP",Country:"Japan"},
      {Id:"KE",Country:"Kenya"},
      {Id:"KR",Country:"Korea, Republic of"},
      {Id:"KW",Country:"Kuwait"},
      {Id:"LA",Country:"Lao people's Democratic Republic"},
      {Id:"LV",Country:"Latvia"},
      {Id:"LI",Country:"Liechtenstein"},
      {Id:"LT",Country:"Lithuania"},
      {Id:"LU",Country:"Luxembourg"},
      {Id:"MY",Country:"Malaysia"},
      {Id:"MT",Country:"Malta"},
      {Id:"MN",Country:"Mongolia"},
      {Id:"MA",Country:"Morocco"},
      {Id:"MZ",Country:"Mozambique"},
      {Id:"NA",Country:"Namibia"},
      {Id:"NP",Country:"Nepal"},
      {Id:"NL",Country:"Netherlands"},
      {Id:"AN",Country:"Netherlands Antilles"},
      {Id:"NZ",Country:"New Zealand"},
      {Id:"NO",Country:"Norway"},
      {Id:"PY",Country:"Paraguay"},
      {Id:"PE",Country:"Peru"},
      {Id:"PL",Country:"Poland"},
      {Id:"PT",Country:"Portugal"},
      {Id:"SA",Country:"Saudi Arabia"},
      {Id:"RS",Country:"Serbia"},
      {Id:"SG",Country:"Singapore"},
      {Id:"SK",Country:"Slovakia"},
      {Id:"SI",Country:"Slovenia"},
      {Id:"ZA",Country:"South Africa"},
      {Id:"ES",Country:"Spain"},
      {Id:"LK",Country:"Sri Lanka"},
      {Id:"SZ",Country:"Swaziland"},
      {Id:"SE",Country:"Sweden"},
      {Id:"CH",Country:"Switzerland"},
      {Id:"TW",Country:"Taiwan, Province Of China"},
      {Id:"TH",Country:"Thailand"},
      {Id:"TR",Country:"Turkey"},
      {Id:"UG",Country:"Uganda"},
      {Id:"UA",Country:"Ukraine"},
      {Id:"AE",Country:"United Arab Emirates"},
      {Id:"VE",Country:"Venezuela, Bolivarian Republic Of"},
      {Id:"VG",Country:"Virgin Islands (British)"},
      {Id:"VI",Country:"Virgin Islands (U.S.)"},
      {Id:"YE",Country:"Yemen"},
      {Id:"ZM",Country:"Zambia"},
      {Id:"ZW",Country:"Zimbabwe"},
  ];
  
  $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");      
  });
  
  // LOAD MIDGROUPS
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


  // NOTIFY ADD MERCHANT
  Notify.getMsg('NewMerchant', function(event,data) {
    $scope.groupsBulk.push(data);
  });

  // NOTIFY EDIT MERCHANT
  Notify.getMsg('MerchantUpdated', function(event,data) {

    $http.get(baseUrl + 'midgroups').success(function(data) {
      $scope.groupsBulk = data;
    });

  });

  // LOAD CURRENCIES
  $http.get(baseUrl + 'currencies').success(function(data) {
      $scope.currencies = data;
  });


  // LOAD GATEWAYS
  $rootScope.gateways = [];

  $http.get(baseUrl + 'gateways').success(function(data) {
   
    $scope.gateways = data; 
    
    angular.forEach(data, function(value,key) {
            $rootScope.gateways.push(value);
    });
      
  });


  // LOAD MIDS
  $http.get(baseUrl + 'mids').success(function(data) {
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

    //    CSV EXPORT
    $scope.midsCSV = data;

    //    REMOVE MID
    Notify.getMsg('removedMid', function(event,index) {

        $http.get(baseUrl + 'mids').success(function(data) {
            $scope.mids = data;
            $scope.shownMids = $scope.mids;
            $scope.dataLen = data.length;
        });

        //console.log('view should update');

    });

    //    DISABLE MID
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

  //////////////////////////
  // NOTIFY DELETE MERCHANT
  //////////////////////////
  Notify.getMsg('RemoveMerchant', function(event,data) {
    $scope.groupsBulk.splice(data,1);
  });


  ////////////
  // SIDENAV
  ////////////
  $scope.isCollapsed = [true, true];
  
  
  $scope.checkState = function(e) {
    $timeout(function() {
      var currentState = $state.current.name;

      //FIND STATE TO DISPLAY THE DROPDOWNS
      if(currentState === 'app.merchants.mids') {
        $scope.merchantParent = "parent";
        $scope.recurParent = "";
        $scope.isCollapsed[0] = false;
        $scope.isCollapsed[1] = true;

      } else if(currentState === 'app.recurring_payments.subscriptions') {
        $scope.merchantParent = "";
        $scope.recurParent = "parent";
        $scope.isCollapsed[0] = true;
        $scope.isCollapsed[1] = false;

      } else {
        $scope.merchantParent = "";
        $scope.recurParent = "";
        $scope.isCollapsed[0] = true;
        $scope.isCollapsed[1] = true;
      }
    },100);
  }

  //USES ROUTE TO SEND USER TO CORRECT PATH
  $scope.goTo = function(path) {
    $state.go(path);
  }

  //PROVIDES THE NAME OF WHICH NAV BTN HAS BEEN SELECTED FOR PROPER CSS STYLE
  $scope.noteState = function(name) {
    return $state.current.name + name;
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
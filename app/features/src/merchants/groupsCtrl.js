app.controller('groupsCtrl', function($timeout,$filter,$rootScope,$scope,$http,$state,baseUrl,Notify,$location) {

  $scope.shownMerchants = $scope.groupsBulk;
  
  // LOAD MIDS INTO NESTED TABLE
  $scope.loadMIDS = function(id,merchant,item) {
    
    // set current group id to add MIDS
    $rootScope.currentGroupId = id;
    $rootScope.currentGroupName = merchant.Name;

    // close all open nested tables
    
    // LOAD MIDS FOR SPECIFIC GROUP
    var url = baseUrl + '/midgroups/' + id + '/mids';
    $http.get(url).success(function(data) {
      $scope.mids = data;
      $rootScope.mids = data;

    
      Notify.getMsg('RemovedMID', function(event,data) {

        $http.get(url).success(function(data) {
          $scope.mids = data;
        });

      });

      Notify.getMsg('UpdatedMID', function(event,data) {

        $http.get(url).success(function(data) {
          $scope.mids = data;
        });        

      });

      $scope.isMidLoaded = true;
      //console.log(data);
    });

};

$scope.gotoMID = function(index,shownMerchants) {

/*
  $timeout(function() {
    if($scope.isMidLoaded) {

       shownMerchants[index].open = !shownMerchants[index].open;

       // set the location.hash to the id of
      // the element you wish to scroll to.
      // each row has a class of base and then the items $index
      
        $location.hash('base' + index);
        //$anchorScroll();
      
       
    } else {
      
    }
  },1000);
*/

  shownMerchants[index].open = !shownMerchants[index].open;

};

$scope.checkWindow = function(info) {
   //console.log(index);
   console.log(info[0]);
   
};

$scope.CapValues = [
  {'value':10},
  {'value':20},
  {'value':30},
  {'value':40},
  {'value':50},
  {'value':60},
  {'value':70},
  {'value':80},
  {'value':90},
];


}); // mainMerchantCtrl

/////////////////
// GROUP CREATE
/////////////////

app.controller('createMerchantModalCtrl', function($scope,$modal,$log,$http) {

    $scope.open = function() {
     var modalInstance = $modal.open({
        templateUrl:'merchantCreateContent.html',
        controller:merchantCreateInstanceCtrl,
        size:'lg'
     });
  };

});


var merchantCreateInstanceCtrl = function($scope,$modalInstance,$http,$timeout,$window,$state,baseUrl,$rootScope,Notify) {

$http.get( baseUrl + 'currencies').success(function(data) {
    $scope.currencies = data;
});

$scope.actives = [
  'exit',
  'enter',
  'loading'
];

// SELECT OPTIONS
$scope.BalancingTypes = [
   {BalancingTypeId:0, BalancingType:"None"},
   {BalancingTypeId:1, BalancingType:"Cap"},
   {BalancingTypeId:2, BalancingType:"Priority"}
];
$scope.CapValues = [
  {'value':10},
  {'value':20},
  {'value':30},
  {'value':40},
  {'value':50},
  {'value':60},
  {'value':70},
  {'value':80},
  {'value':90},
];


   $scope.merchantCreateForm = {};

   $scope.submitUserCreate = function() {

    if(document.getElementById('merchantGroupName').value === '') {
      $('.nameError').slideDown(300);
      
      $scope.createErrorMsg = 'Please Enter A User Name';
        // hide error messages
        $timeout(function() {
          $('.nameError').slideUp(300);
        },1500);
    } else {

      $('.merchant_feedback').slideDown(300);
      $('.create_btn').hide();
      $('.save_btn').slideDown(300);
    }

   };

   $scope.ok = function() {
       
       var merchantDetails = {
          "Name":document.getElementById('merchantGroupName').value,
          "CapLimitNotificationEmails":document.getElementById('MerchantEmail').value,
          "BalancingType":document.getElementById('BalancingType').value,
          "Currency":document.getElementById('Currency').value
    };
        

       //console.log(merchantDetails);
       // POST REQUEST
       var promise = $http({
          method:'POST',
          url: baseUrl + 'midgroups',
          data:merchantDetails
      }).success(function(data) {

        Notify.sendMsg('NewMerchant', data);
          //$rootScope.$data.push(merchantDetails);

          //console.log('merchant group added');
          $('.userCreateSuccess').show();
          $('.merchant_feedback').hide();

          //$window.location.reload();
          //$state.go($state.$current, null, {reload: true });
          $timeout(function() {
            $modalInstance.close();
          },1000);

      }).error(function(data,status) {
          console.log(status);
      });

   }; // END ok

   $scope.cancel = function() {
       $modalInstance.close();
    };
};

/////////////////
// GROUP DELETE
/////////////////
app.controller('removeMerchantModalCtrl', function($scope,$modal,$log) {
    $scope.open = function(index,merchant) {
       var modalInstance = $modal.open({
          templateUrl:'merchantRemoveContent.html',
          controller:removeMerchantInstanceCtrl,
          size:'lg',
          resolve: {
            merchant:function() {
              return merchant;
            },
            index:function() {
              return index;
            }
          }
       });
    };
});

var removeMerchantInstanceCtrl = function($scope,$modalInstance,$log,merchant,$http,$timeout,Notify,index,baseUrl) {

    $scope.merchant = merchant;

    $scope.cancel = function() {
      $modalInstance.close();
    };

    // Confirm Group Delete
    $scope.removeGroup = function() {
      
      $http({
        method:'DELETE',
        url: baseUrl + 'midgroups/' + merchant.Id
      }).success(function(status,data) {

        Notify.sendMsg('RemoveMerchant', index);

        console.log('group removed' + status);

        $('.userCreateSuccess').show();

        $timeout(function() {
          $modalInstance.close();
        },500);

      });
      
    };

};


/////////////////////
// ADD MIDS TO GROUP
/////////////////////
app.controller('addMIDSmodalCtrl', function($scope,$modal,$log) {
    $scope.openMID = function(merchant) {
           var modalInstance = $modal.open({
              templateUrl:'addMIDSContent.html',
              controller:addMIDSInstanceCtrl,
              size:'lg',
              resolve: {
                merchant:function() {
                  return merchant;
                }
              }
           });
        };
});

var addMIDSInstanceCtrl = function($scope,$modalInstance,$log,$timeout,$rootScope,merchant,$http,baseUrl) {
  

  $scope.cancel = function() {
    $modalInstance.close();
  };

  $scope.confirmMID = function() {

    var data = $scope.flaggedMIDS[0];
    

    var Url = baseUrl + '/midgroups/' + $rootScope.currentGroupId + '/mids';

    $http({
      method:'POST',
      url:Url,
      data:data
    }).success(function(status) {
      console.log(status);

      // Update UI
      $rootScope.mids.push(data);

      // Remove From Modal List

    });
    

  }; // END confirmMID

  // Currently displayed Group ID
  $scope.groupID = $rootScope.currentGroupId;
  $scope.groupName = $rootScope.currentGroupName;


  // load available rollover mids
  $http.get( baseUrl + 'midgroups/' + $scope.groupID + '/available-mids').success(function(data) {
    $scope.availableMIDS = data;
    //console.log($scope.availableMIDS[0].DisplayName);
    //$rootScope.availableMIDS = data;
  });


  $scope.addMID = function(index,mid) {

    $http({
      method:'POST',
      url:baseUrl + 'midgroups/' + $scope.groupID + '/mids',
      data:mid
    }).success(function(data) {
      console.log(status);
      console.log('mid added');

      $('.userCreateSuccess').slideDown(300);

      // Update UI
      $scope.availableMIDS.splice(index,1);

      // Update Parent UI
      $rootScope.mids.push(mid);

      $timeout(function() {
        $('.userCreateSuccess').slideUp(300);
      },500);
    });

    

  };
  

};


// EDIT MODALS
app.controller('editMerchantModalCtrl', function($scope,$http,$modal,$log) {

    $scope.open = function(merchant) {
     var modalInstance = $modal.open({
      templateUrl:'merchantEditContent.html',
      controller:merchantEditInstanceCtrl,
      size:'lg',
      resolve: {
        merchant:function() {
           return merchant;
        }
      }
     });
  };

});

// MODAL INSTANCE
var merchantEditInstanceCtrl = function($scope,$modalInstance,$http,$timeout,merchant,baseUrl,Notify) {
  //console.log(merchant.BalancingType);
 
  $scope.original = merchant;
  $scope.merchant = angular.copy(merchant);


// CURRENCY SERVICE
$http.get( baseUrl + 'currencies').success(function(data) {
    $scope.currencies = data;
});

$scope.BalancingTypes = [
   {BalancingTypeId:0, BalancingType:"None"},
   {BalancingTypeId:1, BalancingType:"Cap"},
   {BalancingTypeId:2, BalancingType:"Priority"}
];


  $scope.cancel = function() {
    // Reset object to original object
    // Abandon our copied object
    $scope.merchant = $scope.original

    $modalInstance.close();

  };

  $scope.updateMerchant = function(merchant) {

    var updateQuery = {
      "Name":$scope.merchant.Name,
      "CapLimitNotificationEmails":$scope.merchant.CapLimitNotificationEmails,
      "Currency":$scope.merchant.Currency,
      "BalancingType":$scope.merchant.BalancingType
    };

    //console.log(merchant.Id)
    console.log(updateQuery);

    // PUT REQUEST
    
    $http({
      method:'PUT',
      url:baseUrl + '/midgroups/' + merchant.Id,
      data:updateQuery
    }).success(function(status,data) {

       //console.log(data);
       //console.log('merchant updated');

      // UPDATE LOCAL UI DATA
      Notify.sendMsg('MerchantUpdated',data);

      // SUCCESS MSG
      $('.userCreateSuccess').slideDown(300);
      // HIDE SUCCESS MSG
      $timeout(function() {
        $('.userCreateSuccess').slideUp(300);
        //$modalInstance.close();
      },2000);

    });
    
    
    
    


  };

  /*
  $scope.submitMerchantUpdate = function() {
      $('.merchant_feedback').slideDown(300);
      $('.create_btn').remove();
      $('.save_btn').show();
  };
  */
  /*
  $scope.confirmMerchantUpdate = function(id) {

    var merchantDetails = {
      "Name": document.getElementById('merchantFormName').value,
      "CapNotificationThreshold": document.getElementById('merchantFormCap').value,
      "CapLimitNotificationEmails": document.getElementById('merchantFormEmail').value,
      "BalancingType": document.getElementById('merchantFormBalancingType').value
    };
    
    // POST REQUEST
    var promise = $http({
      method:'PUT',
      url: baseUrl + 'midgroups/' + id,
      data:merchantDetails
    });
    promise.success(function(data) {
      
      $('.userCreateSuccess').show();
      console.log('MID Group Updated');


      $timeout(function() {
        $modalInstance.close();
      },2000);

    }).error(function(status) {
      console.log(status);
    });

  }; // end confirmUpdate

// XEDITABLE MERCHANT UPDATE MODAL
$scope.saveUpdate = function(data,id) {
   
   angular.extend(data,{id:id});
      return $http.put( baseUrl + 'midgroups/' + id, data).success(function(data,status) {
        console.log(status);
        $('.userCreateSuccess').show();

        $timeout(function() {
          $('.userCreateSuccess').fadeOut(1000);
        },2000);
      });

}; // saveUpdate
*/



}; // Edit Instance END



// CONFIRM MID REMOVE MODAL
app.controller('midsConfirmModalCtrl', function($scope,$modal,$log) {

    $scope.openMID = function(index,mid) {
     var modalInstance = $modal.open({
      templateUrl:'midsConfirmModalContent.html',
      controller:midsConfirmModalInstanceCtrl,
      size:'lg',
      resolve: {
        mid: function() {
          return mid;
        },
        index: function() {
          return index;
        }
      } 
     });
    };

});


var midsConfirmModalInstanceCtrl = function($scope,$modalInstance,mid,baseUrl,$rootScope,$http,$timeout,index,Notify) {

  $scope.mid = mid;
  $scope.index = index;

  $scope.cancel = function() {
       $modalInstance.close();
  };

  // REMOVE MID
  $scope.removeMID = function(index,mid) {
   
  // Remove MID from Group
  
  var Url = baseUrl + 'midgroups/' + $rootScope.currentGroupId + '/mids/' + mid.Id;
  $http({
    method:'DELETE',
    url:Url
  }).success(function(data,status) {

    // NOTIFY UI
    Notify.sendMsg('RemovedMID',data);

    console.log(status);

    $('.userCreateSuccess').slideDown(300);

    $timeout(function() {
      $modalInstance.close();
    },1500);

    //$rootScope.mids.splice($scope.index,1);
    
  });
  
   

  };

};


// MIDS MODAL CTRL
app.controller('midsModalCtrl', function($scope,$modal,$log) {

    $scope.openIt = function(mid) {
     var modalInstance = $modal.open({
      templateUrl:'midsModalContent.html',
      controller:midsModalInstanceCtrl,
      size:'lg',
      resolve: {
        mid: function() {
          return mid;
        }
      }
      
     });
  };

});

var midsModalInstanceCtrl = function($scope,$modalInstance,$http,$timeout,mid,$window,baseUrl,$rootScope,Notify) {

  //console.log($scope.currentGroupId + ' ' + mid.Id);
  
  //$scope.merchantId = merchant.Id;
  //$scope.merchantName = merchant.Name;
  $scope.mid = mid;
  $scope.RolloverMidName = mid.RolloverMidName;
  console.log(mid);
  
  //console.log(mid);

  $scope.currentGroupId = $rootScope.currentGroupId;

  //var requestUrl = baseUrl + 'midgroups/' + $scope.currentGroupId + '/mids/' + mid.Id + '/available-rollovers';

  // Values to Populate Form
  $http.get( baseUrl + 'midgroups/' + $scope.currentGroupId + '/mids/' + mid.Id + '/available-rollovers').success(function(data) {
    //console.log(data);
    //$scope.rollOvers = data;
    
    $scope.rollOvers = [];
    angular.forEach(data, function(value,key) {
        $scope.rollOvers.push(value);
    });
      

  });


  // EXIT
  $scope.cancel = function() {
       $modalInstance.close();
  };

  // UPDATE MID
  $scope.updateMID = function(rollover) {
     //console.log(rollover);

     
     $http({
        method:'PUT',
        url:baseUrl + 'midgroups/' + $scope.currentGroupId + '/mids/' + mid.Id + '/rollover/' + rollover
     }).success(function(data,status) {

        console.log(status);

        Notify.sendMsg('UpdatedMID', data);

        $('.userCreateSuccess').slideDown(300);
        $timeout(function() {
          $('.userCreateSuccess').slideUp(300);
        },2000);


     });
    
  };

};
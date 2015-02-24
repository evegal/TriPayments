app.controller('subscriptionsCtrl', function($timeout,$filter,$rootScope,$scope,$http,$state,baseUrl,Notify,$location,SubscriptionsService) {

    //SubscriptionsService LOCATED SERVICES.JS WILL HOLD THE GET RESPONSE 
    //FOR SUBSCRIPTIONS TO BE SHARED WITH ALL CONTROLLERS

    var SubCtrlService = this;  
    SubCtrlService.SubscriptionsService = SubscriptionsService;

  // GET RECURRING SUBSCRIPTIONS
    $http.get(baseUrl + 'recurring/subscriptions').
    success(function(data, status) {
      SubCtrlService.SubscriptionsService.getData = data;
      SubCtrlService.SubscriptionsService.getDataCount = data.length;
      $scope.displaySubscriptions = SubCtrlService.SubscriptionsService.getData;
      //CSV Export
      $scope.subscriptionsCSV = data;     
    }).
    error(function(status) {
      console.log(status);
    });
}); // subscriptionsCtrl

//  SUBSCRIPTION CREATION MODAL
app.controller('subscriptionsCreateModal', function($scope,$modal,$log) {
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl:'subscriptionCreateModal.html',
            controller:subscriptionCreateModalInstance,
            size:'lg'
        });
    }
});

var subscriptionCreateModalInstance = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl,SubscriptionsService) {

    //SubscriptionsService LOCATED SERVICES.JS WILL HOLD THE GET RESPONSE 
    //FOR SUBSCRIPTIONS TO BE SHARED WITH ALL CONTROLLERS
    var SubCreateModal = this;  
    SubCreateModal.SubscriptionsService = SubscriptionsService;

    $scope.cancel = function() {
        $modalInstance.close();
    }

    $scope.SubscriptionPlanId = '';
    $scope.subscriptionProcessors = [];
    $scope.selectProcessingID = '';

    //CREATE SUBSCRIPTION STEP 1 SUBSCRIPTION CONFIG
    $scope.subscriptionCreateConfig = function(theForm) {
        // BIND CREDIT CARD CHECKBOXES
        $scope.paymentTypes = [];
        $('input[name=cardCheckbox]:checked').each(function() {
            $scope.paymentTypes.push($(this).val());
        });

        // BIND CURRENCY CHECKBOXES
        $scope.currencyTypes = [];
        $('input[name=curTypeCheckbox]:checked').each(function() {
            $scope.currencyTypes.push($(this).val());
        })

        if(theForm.$valid && $scope.paymentTypes.length > 0 && $scope.currencyTypes.length > 0) {
            var Query = {
                "DisplayName":document.getElementById('subscriptionFormName').value,
                "PlanTypeId":document.getElementById('subscriptionFormRecurringType').value,
                "DateOrDays":document.getElementById('subscriptionFormDateVal').value,
                "Amount":+document.getElementById('subscriptionFormAmount').value,
                "CardTypeIds":$scope.paymentTypes,
                "CurrencyIds":$scope.currencyTypes,
            };

            //IF THIS IS A NEW SUBSCRIPTION
            if (!$scope.SubscriptionPlanId){
                $http({
                    method:'POST',
                    url: baseUrl + 'recurring/setup/plan',
                    data:Query
                }).success(function(data,status) {

                    // ASSIGN ID FOR THE NEW SUBSCRIPTION
                    $scope.SubscriptionPlanId = data.SubscriptionPlanId;

                    // GET SUBSCRIPTION AND PUSH DATA TO SUBSCRIPTION SERVICE
                    $http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
                      SubCreateModal.SubscriptionsService.getData.push(data);
                    });
                   
                    //GET PROCESSING TYPES
                    $http.get(baseUrl + 'recurring/subscriptions/' + $scope.SubscriptionPlanId + '/available-processors').success(function(data) {
                      $scope.subscriptionProcessors = data;
                    });

                    //PROCEED TO FOLLOWING TAB
                    WizardHandler.wizard().next();
                }).error(function(data, status) {
                    $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                    $('.errorMsg').slideDown(500);
                    $timeout(function() {
                        $('.errorMsg').slideUp(500);
                    },3000);    
                });
            
            //NOT A NEW SUBSCRIPTION
            } else {
              $http({
                method:'PUT',
                url:baseUrl + 'recurring/subscriptions/' + $scope.SubscriptionPlanId,
                data:Query
              }).success(function(status,data) {
                // GET SUBSCRIPTION AND PUSH DATA TO SUBSCRIPTION SERVICE
                $http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
                  SubCreateModal.SubscriptionsService.getData.push(data);
                });

                //PROCEED TO FOLLOWING TAB
                WizardHandler.wizard().next();
              });
                
            }

        } else {
            $scope.errorMsg = 'Please ensure that the required fields (*) are entered.';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);
        }

    }

    //GET THE ID OF THE PROCESSING TYPE FOR GROUP OR MID
    $scope.selectProcessingType = function(item) {
      $scope.selectProcessingID = item;
    }

    //POST THE PROCESSING TYPE AND PROCESSING ID FOR GROUP OR MID
    $scope.subscriptionSelectProcessing = function(theForm) {

      var subProcesingType = document.getElementById('subscriptionSelProcessingType').value,
          Query = {};

      if(theForm.$valid){
        if(subProcesingType == 1) {
          var Query = {
            "ProcessWithMidGroupId":$scope.selectProcessingID,
          };
        } else {
          var Query = {
            "ProcessWithMidId":$scope.selectProcessingID,
          };
        }

        $http({
          method:'POST',
          url: baseUrl + 'recurring/setup/plan/'+$scope.SubscriptionPlanId+'/processor ',
          data:Query
        }).success(function(status) {
          console.log(status);
        });

        WizardHandler.wizard().next();

      } else {
        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);
        WizardHandler.wizard().next();
      }

    } // END subscriptionSelectProcessing

    //POST THE SUBSCRIPTION DECLINE RULES
    $scope.subscriptionDeclineRules = function(theForm){
      console.log('TheForm : ' + theForm);
      console.log(theForm.$valid);

      if(theForm.$valid){
        var Query = {
            "CreditCardRetryLimit":+document.getElementById('subscriptionCCAttempt').value,
            "AchRetryLimit ":+document.getElementById('subscriptionACHAttempt').value,
            "DaysBetweenRetryAttempts":+document.getElementById('subscriptionCCAttemptLapse').value,
            //missing lapse days for ACH and CC
            "DeclineNotificationRecipients":document.getElementById('subscriptionDeclinedEmail').value,
        };

        console.log(Query);

        $http({
          method:'POST',
          url:baseUrl + 'recurring/setup/plan/' + $scope.SubscriptionPlanId + '/decline-rules',
          data:Query
        }).success(function(status,data) {
          console.log(status);
          console.log(data);
          //PROCEED TO FOLLOWING TAB
          WizardHandler.wizard().next();
        });   
      } else {
        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);
      }


   

    } // END subscriptionDeclineRules

 


}  // END SUBSCRIPTION CREATION MODAL


///////////////////////
// SUBSCRIPTIONS DELETE 
///////////////////////
app.controller('subscriptionDeleteModalCtrl', function($scope,$modal,$log) {
    $scope.open = function(index, subscriptionId, subscriptionName) {
       var modalInstance = $modal.open({
          templateUrl:'subscriptionDeleteModal.html',
          controller:subscriptionDeleteInstanceCtrl,
          size:'lg',
          resolve: {
            index:function() {
              return index;
            },
            subscriptionId:function() {
              return subscriptionId;
            },
            subscriptionName:function() {
              return subscriptionName;
            }
          }
       });
    };
});

var subscriptionDeleteInstanceCtrl = function($scope,$rootScope,$modalInstance,$log,index,subscriptionId,subscriptionName,$http,$timeout,Notify,baseUrl,SubscriptionsService) {

    //SubscriptionsService LOCATED SERVICES.JS WILL HOLD THE GET RESPONSE 
    //FOR SUBSCRIPTIONS TO BE SHARED WITH ALL CONTROLLERS
    var SubDelModal = this;  
    SubDelModal.SubscriptionsService = SubscriptionsService;

    $scope.subscriptionId = subscriptionId;
    $scope.subscriptionName = subscriptionName;

    $scope.cancel = function() {
      $modalInstance.close();
    };



    // CONFIRM SUBSCRIPTION DELETE
    $scope.deleteSubscription = function() {

    //DELETE METHOD 
      $http({
        method:'DELETE',
        url: baseUrl + 'recurring/subscriptions/' + $scope.subscriptionId
      }).success(function(status,data) {
        //REMOVE SUBSCRIPTION FROM VIEW
        SubDelModal.SubscriptionsService.getData.splice(index,1);

        //DISPLAY SUCCESS
        $('.userCreateSuccess').show();
        $timeout(function() {
          $modalInstance.close();
        },500);

      }).error(function(data, status) {
        $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status ;
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);    
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
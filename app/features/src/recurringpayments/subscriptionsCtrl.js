app.controller('subscriptionsCtrl', function($timeout,$filter,$rootScope,$scope,$http,$state,baseUrl,Notify,$location) {

///////////////////////////////
// GET RECURRING SUBSCRIPTIONS
///////////////////////////////
$http.get(baseUrl + 'recurring/subscriptions').
  success(function(data, status) {
    $scope.originalSubscriptions = data;
    $scope.displaySubscriptions = $scope.originalSubscriptions;
    $scope.subscriptionCount = data.length;
    //CSV Export
    $scope.subscriptionsCSV = data;
  }).
  error(function(status) {
    console.log(status);
  });


  
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


//  MID CREATION MODAL
app.controller('subscriptionsCreateModal', function($scope,$modal,$log) {
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl:'subscriptionCreateModal.html',
            controller:subscriptionCreateModalInstance,
            size:'lg'
        });
    }
});

var subscriptionCreateModalInstance = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl) {

    $http.get(baseUrl + 'gateways/processors').success(function(data) {
        $scope.processors = data;
    });

    $scope.Groups = $rootScope.modalGroups

    $scope.currentGateways = [];

    // GET CURRENT USER GATEWAYS
    $http.get(baseUrl + 'gateways/current').success(function(data) {
        $scope.curGates = data;

        angular.forEach(data, function(value,key) {
            $scope.currentGateways.push(value);
        });
        

    }); // END GET REQUEST


    // CLOSE MODAL
    $scope.cancel = function() {
        $modalInstance.close();
    }

    // SELECT PRE_EXISTING GATEWAY
    $scope.selectUpdate = function(item) {
        //console.log(item);
        for(var i=0;i<$scope.curGates.length;i++) {
            if($scope.curGates[i].MerchantGatewayId === item) {

                $scope.ChosenGateway = $scope.curGates[i];
                $scope.newGatewayUsername = $scope.ChosenGateway.GatewayUsername;
                $scope.GatewayType = $scope.ChosenGateway.GatewayType;
                $scope.IsActive = $scope.ChosenGateway.Active;
            }
        }

    } // END SELECTION PRE-EXISTING GATEWAY



    // GET PAYMENT TYPES   
    $http.get( baseUrl + 'mids/paymentTypes').success(function(data) {
        
        angular.forEach(data, function(value,key) {
        });

    });
    

    // USER SEARCH FOR PREXISTING GATEWAY CONFIG INTIAL IS FALSE
    $scope.preExist = false;   
    //MID STEP 1 GATEWAY CONFIGURATION
    $scope.midCreateGatewayConfig = function(theForm,selectedMerchant,selectedPro) {

        if(theForm.$valid) {
       
            var Query = {
            "GatewayId":selectedMerchant,
            "MerchantCompany":document.getElementById('MerchantCompany').value,
            "GatewayUsername":document.getElementById('Merchant.UserNamegate').value,
            "GatewayPassword":document.getElementById('Merchant.Passwordgate').value,
            "GatewayType":document.getElementById('GatewayType').value,
            "IsActive":document.getElementById('steponeActive').checked
           }
                     
           // GET ACTUAL TXT OF DROPDOWN NOT JUST ID
           var selectedGate = document.getElementById('GatewayId');
           $scope.gatewayIdTxt = selectedGate.options[selectedGate.selectedIndex].text;

           $scope.processorId = document.getElementById('processorId').value;
           $scope.newMerchantCompany = document.getElementById('MerchantCompany').value;
           $scope.newGatewayUsername = document.getElementById('Merchant.UserNamegate').value;
           $scope.GatewayType = document.getElementById('GatewayType').value;
           $scope.IsActive = document.getElementById('steponeActive').checked;
           
           console.log(Query);

           $http({
                method:'POST',
                url: baseUrl + 'mids/setup/gateway',
                data:Query
            }).success(function(data,status) {
                console.log(data);
                // SAVE New merchant id for use in Step 2
                $scope.NewExistGateway = data.newMerchantGatewayId;
                $scope.gatewayId = data.gatewayId;

                WizardHandler.wizard().next();

            });

        } else {           
            $scope.errorMsg = 'Please fill in all fields in this form.';
            $('.errorMsg').slideDown(500);           
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);

        }
    } // END midstep1
    
    //MID STEP 1.5 PRE-EXISTING GATEWAY
    $scope.midPreExistGatewayConfig = function(theForm) {

        if(theForm.$valid) {
            var Query = {
              "ExistingMerchantGatewayId": $scope.ChosenGateway.MerchantGatewayId,  
              "IsActive": true
            };
        
            $http({
                method:'POST',
                url: baseUrl + 'mids/setup/gateway',
                data:Query
            }).success(function(data) {
                console.log(data);

                $scope.NewExistGateway = data.newMerchantGatewayId;
                $scope.gatewayId = data.gatewayId;
                
                WizardHandler.wizard().next();
            });
        
        } else {
            $scope.emptyField = 'Please Make A Selection';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },2500);
        }       
    } // END MIDSTEP 1.5

    //MID STEP 2 CONFIGURE MID OPTIONS
    $scope.midCreateConfigOptions = function(theForm) {

        // BIND CREDIT CARD CHECKBOXES
        $scope.paymentTypes = [];
        $('input[name=cardCheckbox]:checked').each(function() {
            $scope.paymentTypes.push($(this).val());
        });
                   
        // BIND CURRENCY CHECKBOXES
        $scope.currencyTypes = [];
        $('input[name=curTypeCheckbox]:checked').each(function() {
            $scope.currencyTypes.push($(this).val());
        });

        // ENSURE ALL REQUIRED FIELDS ARE FILLED TO INCLUDE CARD TYPES AND CURRENCY
        if(theForm.$valid && $scope.paymentTypes.length > 0 && $scope.currencyTypes.length > 0) {
            var Query = {
                "GatewayId":$scope.gatewayId,
                "MerchantGatewayId":$scope.NewExistGateway,
                "Mid":document.getElementById('MIDconfig').value,
                "Descriptor":document.getElementById('MIDdescriptor').value,
                "DisplayName":document.getElementById('MIDdisplayName').value,
                "MonthlyCap":+document.getElementById('MIDmonthlyCap').value,
                "PaymentTypeIds":$scope.paymentTypes,
                "CurrencyIds":$scope.currencyTypes,
                "limitType":document.getElementById('limitType').value,
                "DailyRebillProcessingLimit":+document.getElementById('dailyRebill').value,
                "GatewayFeeRetail":+document.getElementById('MIDgatewayFee').value,
                "TransactionFee":+document.getElementById('MIDtransactionFee').value,
                "ChargebackFee":+document.getElementById('MIDchargeBackFee').value,
                "ReserveAccountRate":+document.getElementById('MIDreserveAccountRate').value,
                "RetailDiscountRate":+document.getElementById('MIDiscount').value
            };

            $scope.Descriptor = document.getElementById('MIDdescriptor').value;
            $scope.MidConfig = document.getElementById('MIDconfig').value;
            $scope.DisplayName = document.getElementById('MIDdisplayName').value;
            $scope.MonthlyCap = document.getElementById('MIDmonthlyCap').value;

            //IF THIS ISNT A NEW MID
            if (!$scope.newMidId){
                console.log('this is new MID');

                $http({
                    method:'POST',
                    url: baseUrl + 'mids/setup/mid',
                    data:Query
                }).success(function(data,status) {
                            
                    Notify.sendMsg('NewMidUpdate', data);

                    $scope.newMidId = data.newMidId;
                    console.log($scope.newMidId);
                    WizardHandler.wizard().next();
                });

            //NOT A NEW MID PATCH EXISTING
            } else {
                Query.MidId = $scope.newMidId;
                      
                $http({
                    method:'PUT',
                    url: baseUrl + 'mids/' + $scope.newMidId,
                    data:Query
                }).success(function(data,status) {
                    Notify.sendMsg('NewMidUpdate', data);
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

    //MID STEP 3 EMAIL CONFIGURATIONS
    $scope.emails = [];

    /* THESE FIELDS ARE COMMENTED OUT DO TO ENDPOINT DOESNT RECIEVE ANY OF THESE OPTIONS    
    $scope.allTypeChange = function() {
        var parentCheck = document.getElementById('allEmailTypes').checked;

        if(parentCheck) {
            document.getElementById('orderConfirm').checked = true;
            document.getElementById('shipment').checked = true;
            document.getElementById('refundCheck').checked = true;
            document.getElementById('capToggle').checked = true;

            $scope.capToggle = true;

        } else {
            document.getElementById('orderConfirm').checked = false;
            document.getElementById('shipment').checked = false;
            document.getElementById('refundCheck').checked = false;
            document.getElementById('capToggle').checked = false;

            $scope.capToggle = false;
        }
        
    } */    
    
    $scope.addEmail = function() {

        var userEmail = document.getElementById('notificationEmail').value,
            notificationType = [2];

            // THESE ADDITIONAL VALUES WILL BE MADE AVAIL ON NEXT VERSION
            //transCheckbox = document.getElementById('transaction').checked,
            //capCheckbox = document.getElementById('capToggle').checked,
            //notificationType = []; 
              
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if(notificationType != '' ){

                if(re.test(userEmail)) {
                    // push to emails Array
                    $scope.emails.push(userEmail);
                    $scope.emailAdded = true;

                    var Query = {
                        "MidId":$scope.newMidId,
                        "Recipient":userEmail,
                        "NotificationTypeIds":notificationType
                    }
                  
                    $http({
                        method:'POST',
                        url:baseUrl + 'mids/setup/notifications',
                        data:Query
                    }).success(function(data,status) {
                        console.log(data);
                    });

                    // CLEAR INPUTS
                    document.getElementById('notificationEmail').value = '';
                    //document.getElementById('transaction').checked = false;
                    //document.getElementById('capToggle').checked = false;

                } else {
                    $scope.errorMsg = 'Please enter a valid email';
                    $('.errorMsg').slideDown(500);
                    $timeout(function() {
                        $('.errorMsg').slideUp(500);
                    },2500);
                } 

            } else{
                $scope.errorMsg = 'Please select an email type';
                $('.errorMsg').slideDown(500);
                $timeout(function() {
                    $('.errorMsg').slideUp(500);
                },2500);                    
            }

    }

    $scope.removeEmail = function(email, index) {
        var midId = $scope.newMidId;

        var Query = {
            "MidId":$scope.newMidId,
            "Recipient":email
        }

        $http({
            method:'DELETE',
            url:baseUrl + 'mids/'+ midId +'/notifications/' + email ,
            data:Query
        }).success(function(data,status) {
            console.log(status);
            console.log(data);
            $scope.emails.splice(index,1);
        });

    }

    //MID STEP 3 ADD NOTIFICATION EMAILS TO MID
    $scope.midCreateNotifyEmail = function(theForm) {
        var userEmail = document.getElementById('notificationEmail').value;

        if (userEmail == '' ) {
            // NEXT STEP
            WizardHandler.wizard().next();
        } else {
            $scope.errorMsg = 'Please add your email.';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },2500); 
        }
    } // END NOTIFICATION EMAILS

    //MID STEP 4 VERIFY CREATED MID
    $scope.midCreateVerify = function() {
       
        var Query =  {
            "MidId":$scope.newMidId
        }
       
        $http({
            method:'POST',
            url: baseUrl + 'mids/setup/verifyMid',
            data:Query
        }).success(function(data,status) {
            console.log(data);
            console.log(status);

            if(data === false) {
                $scope.errorMsg = 'Verification Failed.  However your mid has been created please edit your mid and re-verify before use.';
                $('.final_btn').hide();
                $('.errorMsg').slideDown(500);
            } else if(data === true) {
                $scope.successMsg = 'Verification Successful.'; 
                $('.final_btn').hide();
                $('.successMsg').show();

               Notify.sendMsg('NewMidUpdate', data);

            }

        });
    } // END VERIFY
}  // END MODAL INSTANCE























































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
app.controller('subscriptionsCtrl', function($timeout,$filter,$rootScope,$scope,$http,$state,baseUrl,Notify,$location) {

  $scope.shownSubscriptions = $scope.subscriptionsBulk;
  
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

}); // subscriptionsCtrl


//  SUBSCRIPTION CREATION MODAL
app.controller('subscriptionsCreateModalCtrl', function($scope,$modal,$log) {
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl:'subscriptionCreateModal.html',
            controller:subscriptionCreateModalInstance,
            size:'lg'
        });
    }
});

var subscriptionCreateModalInstance = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl) {

    $scope.cancel = function() {
        $modalInstance.close();
    }

    $scope.subscriptionFormRecurringType = 1;  // JUST CHARGE FOR NOW
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

        //FORM VALIDATION FOR REQUIRED FIELDS AND SELECTION OF PAYMENT TYPE AND CURRENCY
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
                    url: baseUrl + 'recurring/subscriptions',
                    data:Query
                }).success(function(data,status) {

                    // ASSIGN ID FOR THE NEW SUBSCRIPTION
                    $scope.SubscriptionPlanId = data.SubscriptionPlanId;

                    // GET SUBSCRIPTION AND PUSH DATA TO SUBSCRIPTION SERVICE
                    $http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
                      Notify.sendMsg('NewSubscription', data);
                    });
                   
                    //GET PROCESSING TYPES
                    $http.get(baseUrl + 'recurring/subscriptions/' + $scope.SubscriptionPlanId + '/available-processors').success(function(data) {
                      $scope.subscriptionProcessors = data;
                    });

                    //PROCEED TO FOLLOWING TAB
                    WizardHandler.wizard().next();

                }).error(function(data, status) {
                    
                    //SOMETHING ERRONEOUS WITH THE API
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
                //work on this its pulling duplicates with different values
                $http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
                  Notify.sendMsg('NewSubscription', data);
                });

                //PROCEED TO FOLLOWING TAB
                WizardHandler.wizard().next();
              }).error(function(data, status) {
                    
                  //SOMETHING ERRONEOUS WITH THE API
                  $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                  $('.errorMsg').slideDown(500);
                  $timeout(function() {
                      $('.errorMsg').slideUp(500);
                  },3000);    
              });
                
            }

        } else {

          //SOMETHING ERRONEOUS WITH THE FORM
          $scope.errorMsg = 'Please ensure that the required fields (*) are entered.';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

        }

    }

    //GET THE ID OF THE MID FOR PROCESSING
    $scope.selectProcessingType = function(item) {
      $scope.selectProcessingID = item;
    }

    //POST THE PROCESSING TYPE AND PROCESSING ID FOR GROUP OR MID
    $scope.subscriptionSelectProcessing = function(theForm) {     

      if(theForm.$valid){
        
        var Query = {"ProcessWithMidId":$scope.selectProcessingID};

        $http({
          method:'POST',
          url: baseUrl + 'recurring/subscriptions/'+$scope.SubscriptionPlanId+'/processor ',
          data:Query
        }).success(function(status) {

          WizardHandler.wizard().next();

        }).error(function(data, status) {
                    
            //SOMETHING ERRONEOUS WITH THE API
            $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);    
        });

      } else {

        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);

      }

    } // END subscriptionSelectProcessing

    //POST THE SUBSCRIPTION DECLINE RULES
    $scope.subscriptionDeclineRules = function(theForm){

      var declineNotificationEmail = document.getElementById('subscriptionDeclinedEmail').value,
          re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(theForm.$valid && re.test(declineNotificationEmail)){
        var Query = {
            "CreditCardRetryLimit":+document.getElementById('subscriptionCCAttempt').value,
            "AchRetryLimit":+document.getElementById('subscriptionACHAttempt').value,
            "DaysBetweenCardRetryAttempts":+document.getElementById('subscriptionCCAttemptLapse').value,
            "DaysBetweenAchRetryAttempts":+document.getElementById('subscriptionACHAttemptLapse').value,
            "DeclineNotificationRecipients":declineNotificationEmail,
        };

        $http({
          method:'POST',
          url:baseUrl + 'recurring/subscriptions/' + $scope.SubscriptionPlanId + '/decline-rules',
          data:Query
        }).success(function(status,data) {

          $scope.successMsg = 'Subscription has been setup successfully.';
          $('.successMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
              $modalInstance.close();
          },2000);

        }).error(function(data, status) {
                    
            //SOMETHING ERRONEOUS WITH THE API
            $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);    
        });   

      } else {

        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },1000);

      }

    } // END subscriptionDeclineRules
}  // END SUBSCRIPTION CREATION MODAL

// SUBSCRIPTION DELETE 
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

var subscriptionDeleteInstanceCtrl = function($scope,$rootScope,$modalInstance,$log,index,subscriptionId,subscriptionName,$http,$timeout,Notify,baseUrl) {

    $scope.subscriptionName = subscriptionName;

    $scope.cancel = function() {
      $modalInstance.close();
    };

    // CONFIRM SUBSCRIPTION DELETE
    $scope.deleteSubscription = function() {

    //DELETE METHOD 
      $http({
        method:'DELETE',
        url: baseUrl + 'recurring/subscriptions/' + subscriptionId
      }).success(function(status,data) {

        //REMOVE SUBSCRIPTION FROM VIEW
        Notify.sendMsg('RemoveSubscription', index);

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
}; // END SUBSCRIPTION DELETE

// SUBSCRIPTIONS EDIT
app.controller('subscriptionEditModalCtrl', function($scope,$http,$modal,$log) {

    $scope.open = function(subscriptionId) {
       var modalInstance = $modal.open({
        templateUrl:'subscriptionEditContent.html',
        controller:subscriptionEditInstanceCtrl,
        size:'lg',
        resolve: {
          subscriptionId:function() {
             return subscriptionId;
          }
        }
       });
    };
});

var subscriptionEditInstanceCtrl = function($scope,$modalInstance,$http,$timeout,subscriptionId,baseUrl,Notify,WizardHandler) {

  $scope.subscription = {};
  $scope.subscriptionProcessors = {};

  // PROCESSING METHOD IS SELECTED BASED ON PAYMENT TYPE AND CURRENCY
  // INCASE OF CHANGE THE USER MUST RESELECT THE PROCESSING METHOD
  $scope.currencyChange = false;
  $scope.paymentChange = false;

  $scope.currencyChange = function () {
    $scope.currencyChangeVal = true;
    console.log('currency change');
  };  

  $scope.paymentChange = function () {
    $scope.paymentChangeVal = true;
    console.log('payment change');
  };  

  $scope.cancel = function() {
    $modalInstance.close();
  };

  // GET LATEST FOR THIS SUBSCRIPTION
  $http.get( baseUrl + 'recurring/subscriptions/' + subscriptionId ).success(function(data) {
      $scope.subscription = data;
      
      $scope.subscriptionFormName = $scope.subscription.DisplayName;
      $scope.subscriptionFormRecurringType = $scope.subscription.PlanType.Id; // calendar or days of cycle 
      $scope.subscriptionFormAmount = $scope.subscription.Amount;
      $scope.subscriptionFormCalDate = $scope.subscription.CalendarDayOrInterval;

      // PAYMENT CHECKBOXES
      angular.forEach($scope.subscription.AllowedCardTypes, function(value,key) {
        $scope[ value.Name ] = true;
      });

      // CURRENCY CHECKBOXES
      angular.forEach($scope.subscription.AllowedCurrencies, function(value,key) {
          $scope[ value.Name ] = true;
      });

      // PROCESSING FOR SUBSCRIPTION
      $http.get(baseUrl + 'recurring/subscriptions/' + subscriptionId + '/available-processors').success(function(data) {
        $scope.subscriptionProcessors = data;
      });

      //BIND PREVIOUS SELECTED PROCESSING MID
      $scope.subscriptionSelProcessingMid = $scope.subscription.MidId;

      // DECLINE RULES FOR SUBSCRIPTION
      $scope.subscriptionEditCCAttempt = $scope.subscription.CreditCardMaxRetries;
      $scope.subscriptionEditCCAttemptLapse = $scope.subscription.DaysBetweenCardRetries;
      $scope.subscriptionEditACHAttempt = $scope.subscription.AchMaxRetries;
      $scope.subscriptionEditACHAttemptLapse = $scope.subscription.DaysBetweenAchRetries;
      $scope.subscriptionEditDeclinedEmail = $scope.subscription.DeclineNotificationRecipients;

  }).error(function(data, status) {
                    
      //SOMETHING ERRONEOUS WITH THE API
      $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
      $('.errorMsg').slideDown(500);
      $timeout(function() {
          $('.errorMsg').slideUp(500);
      },4000);    
  });

  $scope.subscriptionEditConfig = function(theForm) {

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

    if(theForm.$dirty && theForm.$valid && $scope.paymentTypes.length > 0 && $scope.currencyTypes.length > 0 ) {

      var Query = {};

      // IF STATEMENT IN CASE A PAYMENT METHOD HAS BEEN CHANGED
      // IT WILL IMPACT THE MID SELECTION
      if ($scope.paymentChangeVal) {
        var Query = {
          "DisplayName":document.getElementById('subscriptionFormName').value,
          "PlanTypeId":document.getElementById('subscriptionFormRecurringType').value,
          "DateOrDays":document.getElementById('subscriptionFormDateVal').value,
          "Amount":+document.getElementById('subscriptionFormAmount').value,
          "CardTypeIds":$scope.paymentTypes,
          "CurrencyIds":$scope.currencyTypes,
          "MidId":'',
          "Mid":'',
        };
        //CLEAR OUT CURRENT MID SELECTION
        $scope.subscriptionSelProcessingMid = '';

      } else {

        var Query = {
          "DisplayName":document.getElementById('subscriptionFormName').value,
          "PlanTypeId":document.getElementById('subscriptionFormRecurringType').value,
          "DateOrDays":document.getElementById('subscriptionFormDateVal').value,
          "Amount":+document.getElementById('subscriptionFormAmount').value,
        };
      }

      $http({
        method:'PUT',
        url:baseUrl + 'recurring/subscriptions/' + subscriptionId,
        data:Query
      }).success(function(status,data) {

        // GET NEW PROCESSING FOR CHANGED CURRENCY SUBSCRIPTION
        if ($scope.paymentChangeVal) {
          $http.get(baseUrl + 'recurring/subscriptions/' + subscriptionId + '/available-processors').success(function(data) {
            $scope.subscriptionProcessors = data;
          });
        }

        $scope.successMsg = 'Subscription configuration has been updated.';
        $('.successMsg').slideDown(500);
        $timeout(function() {
            $('.successMsg').slideUp(500);
            //PROCEED TO FOLLOWING TAB
            WizardHandler.wizard().next();
        },2000);
        
      }).error(function(data, status) {
                    
          //SOMETHING ERRONEOUS WITH THE API
          $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);    
      });

    } else if (!theForm.$dirty) {
      //IF NOTHING HAS CHANGED ON THE FORM
      WizardHandler.wizard().next();
    }else {
      //FORM VALUES HAVE BEEN CHANGED TO SOMETHING ERRONEOUS
      $scope.errorMsg = 'Please ensure to fill out all the fields properly.';
      $('.errorMsg').slideDown(500);
      $timeout(function() {
          $('.errorMsg').slideUp(500);
      },3000); 
    } 
    
  };

  //GET THE ID OF THE PROCESSING TYPE FOR GROUP OR MID
  $scope.selectProcessingType = function(item) {
    $scope.subscriptionSelProcessingMid = item; // default dropdown
  }

  $scope.subscriptionEditProcessing = function(theForm){

      if(theForm.$valid && theForm.$dirty){
        
        var Query = {"ProcessWithMidId":$scope.subscriptionSelProcessingMid};

        $http({
          method:'POST',
          url: baseUrl + 'recurring/subscriptions/'+ subscriptionId +'/processor ',
          data:Query
        }).success(function(status) {
      
          WizardHandler.wizard().next();
      
        }).error(function(data, status) {
                    
            //SOMETHING ERRONEOUS WITH THE API
            $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },4000);    
        });

      } else if (!theForm.$dirty){

        WizardHandler.wizard().next();
      
      } else {

        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },3000);

      }

  };

  $scope.subscriptionEditDeclineRules = function(theForm){
    
      if(theForm.$dirty && theForm.$valid){
        var Query = {
            "CreditCardRetryLimit":+document.getElementById('subscriptionEditCCAttempt').value,
            "AchRetryLimit":+document.getElementById('subscriptionEditACHAttempt').value,
            "DaysBetweenCardRetryAttempts":+document.getElementById('subscriptionEditCCAttemptLapse').value,
            "DaysBetweenAchRetryAttempts":+document.getElementById('subscriptionEditACHAttemptLapse').value,
            "DeclineNotificationRecipients":document.getElementById('subscriptionEditDeclinedEmail').value,
        };

        $http({
          method:'PUT',
          url:baseUrl + 'recurring/subscriptions/' + subscriptionId,
          data:Query
        }).success(function(status,data) {

          $scope.successMsg = 'Subscription has been setup successfully.';
          $('.successMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
              $modalInstance.close();
          },2000);

        }).error(function(data, status) {
                    
            //SOMETHING ERRONEOUS WITH THE API
            $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);    
        });   

      } else {

        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },1000);

      }

  };


}; // Edit Instance END


















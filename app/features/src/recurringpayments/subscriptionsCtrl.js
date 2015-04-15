/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. subscriptionsCtrl
   02. subscriptionsCreateModalCtrl
   03. subscriptionDeleteModalCtrl
   04. subscriptionEditModalCtrl
   05. subscriptionAddSubscriberModalCtrl
   06. subscriberRemoveConfirmModalCtrl
  
 **  *************************************** **/

app.controller('subscriptionsCtrl', function($timeout,$filter,$rootScope,$scope,$http,$state,baseUrl,Notify,$location) {

  // LOAD SUBSCRIPTIONS
  $rootScope.subscriptionModalGroups = [];

    $http.get(baseUrl + 'recurring/subscriptions').success(function(data) {
      $scope.subscriptionsBulk = data;
      $scope.subscriptionsAmount = data.length;

      // CSV Export
      $scope.subscriptionsCSV = data;

      angular.forEach(data, function(value,key) {
         $rootScope.subscriptionModalGroups.push(value);
      }); 

    });


  // NOTIFY ADD SUBSCRIPTION
  Notify.getMsg('NewSubscription', function(event,data) {
    $scope.subscriptionsBulk.push(data);
    $scope.subscriptionsAmount += 1;
  });

  // NOTIFY DELETE SUBSCRIPTION
  Notify.getMsg('RemoveSubscription', function(event,data) {
    $scope.subscriptionsBulk.splice(data,1);
    $scope.subscriptionsAmount -= 1;
  });

  // NOTIFY EDIT SUBSCRIPTION
  Notify.getMsg('SubscriptionUpdated', function(event,data) {
    $http.get(baseUrl + 'recurring/subscriptions').success(function(data) {
      $scope.subscriptionsBulk = data;
    });
  });

  $scope.shownSubscriptions = $scope.subscriptionsBulk;
  
  // LOAD MIDS INTO NESTED TABLE
  $scope.loadSubscribers = function(subscriptionId,subscription,item) {
   
    // SET CURRENT SUBSCRIPTION ID TO ADD SUBSCRIBERS
    $rootScope.currentSubscriptionId = subscriptionId;
    $rootScope.currentSubscriptionName = subscription.DisplayName;

    // LOAD MIDS FOR SPECIFIC GROUP
    var url = baseUrl + 'recurring/subscriptions/' + subscriptionId + '/subscribers';
    $http.get(url).success(function(data) {
      $scope.assignedSubscribers = data;
      $rootScope.assignedSubscribers = data;
  
      Notify.getMsg('RemovedMID', function(event,data) {

        $http.get(url).success(function(data) {
          $scope.assignedSubscribers = data;
        });

      });

      Notify.getMsg('UpdatedMID', function(event,data) {

        $http.get(url).success(function(data) {
          $scope.assignedSubscribers = data;
        });        

      });

      //$scope.isMidLoaded = true;
      //console.log(data);
    });
  };

  $scope.gotoSubscription = function(index,shownSubscriptions) {

    shownSubscriptions[index].open = !shownSubscriptions[index].open;

  };

  $scope.checkWindow = function(info) {
     console.log(info[0]);   
  };
}); // subscriptionsCtrl

// DATE PICKER CONTROLS - GROUP SEARCH
app.controller('subscriptionStartDateCtrl', function($scope){

  // GET TODAY DATE
  $scope.today = function() {
    $scope.fromDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yyyy',
    startingDay: 1
  };

  $scope.initDate = new Date('2013-15-20');
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[3];
});

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

      // ENSURE THERE IS A START DATE
      $scope.StartDateVal = document.getElementById('subscriptionDate').value;

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
        if(theForm.$valid && $scope.paymentTypes.length > 0 && $scope.currencyTypes.length > 0 && $scope.StartDateVal != '' ) {

          // IF THE RECUR FIELD IS LEFT BLANK ASSIGN 999 FOR INFINITY
          $scope.subscriptionRecurCount = document.getElementById('subscriptionRecurCount').value;
          if(!$scope.subscriptionRecurCount){$scope.subscriptionRecurCount = 999;}

            var Query = {
                "DisplayName":document.getElementById('subscriptionFormName').value,
                "StartDate":document.getElementById('subscriptionDate').value,
                "Frequency":document.getElementById('subscriptionPayFrequency').value,
                "RecurrenceCount":$scope.subscriptionRecurCount,
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
                //$http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
                //  Notify.sendMsg('NewSubscription', data);
                //});

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

          // GET SUBSCRIPTION AND DISPLAY IN VIEW
          $http.get(baseUrl + 'recurring/subscriptions/'+ $scope.SubscriptionPlanId).success(function(data) {
            Notify.sendMsg('NewSubscription', data);
          });


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
              $('.successMsg').slideUp(500);
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

    $scope.open = function(subscriptionId,index) {
       var modalInstance = $modal.open({
        templateUrl:'subscriptionEditContent.html',
        controller:subscriptionEditInstanceCtrl,
        size:'lg',
        resolve: {
          subscriptionId:function() {
             return subscriptionId;
          },
          index:function() {
             return index;
          },
        }
       });
    };
});

var subscriptionEditInstanceCtrl = function($scope,$modalInstance,$http,$timeout,subscriptionId,index,baseUrl,Notify,WizardHandler,$filter) {
 
  $scope.subscription = {};
  $scope.subscriptionProcessors = {};

  // PROCESSING METHOD IS SELECTED BASED ON PAYMENT TYPE AND CURRENCY
  // INCASE OF CHANGE THE USER MUST RESELECT THE PROCESSING METHOD
  $scope.currencyChange = false;
  $scope.paymentChange = false;


  $scope.paymentChange = function () {
    $scope.paymentChangeVal = true;
  }; 

  $scope.currencyChange = function () {
    $scope.currencyChangeVal = true;
  };  

  $scope.cancel = function() {
    $modalInstance.close();
  };

  // GET LATEST FOR THIS SUBSCRIPTION
  $http.get( baseUrl + 'recurring/subscriptions/' + subscriptionId ).success(function(data) {

      $scope.subscriptionFormName = data.DisplayName;
      document.getElementById('subscriptionDate').value = $filter('date')(data.StartDate,'MM/dd/yy');
      $scope.subscriptionFormAmount = data.Amount;
      $scope.subscriptionPayFrequency = data.Frequency;
      $scope.subscriptionRecurCount = data.RecurrenceCount;
      $scope.paymentTypes = data.AllowedCardTypes;
      $scope.currencyTypes = data.AllowedCurrencies;

      // PAYMENT CHECKBOXES BINDING TO TRUE
      angular.forEach(data.AllowedCardTypes, function(value,key) {
        $scope[ value.Name ] = true;
      });

      // CURRENCY CHECKBOXES BINDING TO TRUE
      angular.forEach(data.AllowedCurrencies, function(value,key) {
          $scope[ value.Name ] = true;
      });     

      // PROCESSING FOR SUBSCRIPTION
      $http.get(baseUrl + 'recurring/subscriptions/' + subscriptionId + '/available-processors').success(function(data) {
        $scope.subscriptionProcessors = data;
      });

      //BIND PREVIOUS SELECTED PROCESSING MID
      $scope.subscriptionSelProcessingMid = data.MidId;

      // DECLINE RULES FOR SUBSCRIPTION
      $scope.subscriptionEditCCAttempt = data.CreditCardMaxRetries;
      $scope.subscriptionEditCCAttemptLapse = data.DaysBetweenCardRetries;
      $scope.subscriptionEditACHAttempt = data.AchMaxRetries;
      $scope.subscriptionEditACHAttemptLapse = data.DaysBetweenAchRetries;
      $scope.subscriptionEditDeclinedEmail = data.DeclineNotificationRecipients;

  }).error(function(data, status) {
                    
      //SOMETHING ERRONEOUS WITH THE API
      $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
      $('.errorMsg').slideDown(500);
      $timeout(function() {
          $('.errorMsg').slideUp(500);
      },4000);    
  });

  $scope.subscriptionEditConfig = function(theForm) {

    if(theForm.$dirty && theForm.$valid && $scope.paymentTypes.length > 0 && $scope.currencyTypes.length > 0 ) {

      // BIND CREDIT CARD CHECKBOXES
      if ($scope.paymentChangeVal) {
        $scope.paymentTypes = [];
        $('input[name=cardCheckbox]:checked').each(function() {
            $scope.paymentTypes.push($(this).val());
        });
      } 

      // BIND CURRENCY CHECKBOXES
      if($scope.currencyChangeVal){
        $scope.currencyTypes = [];
        $('input[name=curTypeCheckbox]:checked').each(function() {
            $scope.currencyTypes.push($(this).val());
        });
      } 
    
      var Query = {
        "DisplayName":document.getElementById('subscriptionFormName').value,
        "StartDate":document.getElementById('subscriptionDate').value,
        "Frequency":document.getElementById('subscriptionPayFrequency').value,
        "RecurrenceCount":document.getElementById('subscriptionRecurCount').value,
        "Amount":+document.getElementById('subscriptionFormAmount').value,
      };

      // IF STATEMENT IN CASE A PAYMENT METHOD HAS BEEN CHANGED
      // IT WILL IMPACT THE MID SELECTION
      if ($scope.paymentChangeVal) {
        //CLEAR OUT CURRENT MID SELECTION VIEW AND ENDPOINT
        //BIND NEW PAYMENT AND CARD TYPES
        $scope.subscriptionSelProcessingMid = '';
        Query.MidId = '';
        Query.Mid = '';
        Query.CardTypeIds = $scope.paymentTypes;
      }

      if($scope.currencyChangeVal){
        Query.CurrencyIds = $scope.currencyTypes;
      }

      $http({
        method:'PUT',
        url:baseUrl + 'recurring/subscriptions/' + subscriptionId,
        data:Query
      }).success(function(status,data) {
        //UPDATE VIEW
        Notify.sendMsg('SubscriptionUpdated',data);

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
      
          //UPDATE VIEW
          Notify.sendMsg('SubscriptionUpdated');
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

          $scope.successMsg = 'Subscription rules have been successfuly updated.';
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

      } else if (!theForm.$dirty && theForm.$valid) {

        $modalInstance.close();

      } else {

        $scope.errorMsg = 'Please ensure to select all the required fields (*).';
        $('.errorMsg').slideDown(500);
        $timeout(function() {
            $('.errorMsg').slideUp(500);
        },1000);

      }

  };
}; // END EDIT INSTANCE 

// ADD SUBSCRIBERS TO SUBSCRIPTION
app.controller('subscriptionAddSubscriberModalCtrl', function($scope,$modal,$log) {
    $scope.openMID = function(subscription) {
           var modalInstance = $modal.open({
              templateUrl:'addSubscribersContent.html',
              controller:subscriptionAddSubscribersInstanceCtrl,
              size:'lg',
              resolve: {
                subscription:function() {
                  return subscription;
                }
              }
           });
        };
});

var subscriptionAddSubscribersInstanceCtrl = function($scope,$modalInstance,$log,$timeout,$rootScope,subscription,$http,baseUrl) {

  $scope.cancel = function() {
    $modalInstance.close();
  };

  $scope.subscriptionName = subscription.DisplayName;

  // LOAD AVAILABLE SUBSCRIBERS
  $http.get( baseUrl + 'recurring/subscriptions/' + subscription.SubscriptionId + '/available-subscribers').success(function(data) {
    $scope.availableSubscribers = data;
  });

  $scope.addSubscriber = function(index,subscriber) {

    console.log(subscriber);
    var Query = {
        "SubscriberId":subscriber.SubscriberId
    };

    $http({
        method:'POST',
        url:baseUrl + 'recurring/subscriptions/' + subscription.SubscriptionId + '/subscribers',
        data:Query
      }).success(function(data) {

        $('.userCreateSuccess').slideDown(300);


        // REMOVE SELECTED SUBSCRIBER FROM MODAL
        $scope.availableSubscribers.splice(index,1);

        // Update Parent UI
        $rootScope.assignedSubscribers.push(subscriber);


        $timeout(function() {
          $('.userCreateSuccess').slideUp(300);
        },500);
      });

  };
};  // END ADD SUBSCRIBERS TO SUBSCRIPTIONS

// CONFIRM SUBSCRIBER REMOVE FROM SUBSCRIPTION MODAL
app.controller('subscriberRemoveConfirmModalCtrl', function($scope,$modal,$log) {

    $scope.openMID = function(index,subscriber) {
     var modalInstance = $modal.open({
      templateUrl:'subscriberConfirmModalContent.html',
      controller:subscriberRemoveConfirmModalInstanceCtrl,
      size:'lg',
      resolve: {
        subscriber: function() {
          return subscriber;
        },
        index: function() {
          return index;
        }
      } 
     });
    };
});

var subscriberRemoveConfirmModalInstanceCtrl = function($scope,$modalInstance,subscriber,baseUrl,$rootScope,$http,$timeout,index,Notify) {

  $scope.subscriber = subscriber;

  $scope.cancel = function() {
       $modalInstance.close();
  };

  // REMOVE SUBSCRIBER FROM SUBSCRIPTION
  $scope.removeSubscriberSubscription = function(index,subscriber) {
   
    //DELETE METHOD 
      $http({
        method:'DELETE',
        url: baseUrl + 'recurring/subscriptions/' + $rootScope.currentSubscriptionId + '/subscribers/' + subscriber.SubscriberId 
      }).success(function(status,data) {

        console.log(status);
        console.log(data);

        // NOTIFY UI
        Notify.sendMsg('RemovedMID',data);
        

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
}; // END CONFIRM SUBSCRIBER REMOVE FROM SUBSCRIPTION MODAL
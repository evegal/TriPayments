app.controller('subscribersCtrl', function($scope,$http,Notify) {

    $scope.shownSubscribers = $scope.subscribersBulk;

});

//  MID CREATION MODAL
app.controller('subscriberCreateModal', function($scope,$modal,$log) {
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl:'subscriberCreateOrEditContent.html',
            controller:subscriberCreateModalInstance,
            size:'lg'
        });
    }
});

var subscriberCreateModalInstance = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl) {

    //COUNTRY CODES FOR SUBSCRIBER
    $scope.countries = $rootScope.countries;
    
    //DEFAULT COUNTRY CODE SELECTED
    $scope.currentCountry = 'US';
    
    // DEFAULT STATE AND ZIP
    $scope.stateOrProvince = "State";
    $scope.zipOrPostal = "Zip";

    //TRACK CHANGE IN COUNTRY DROPDWON
    $scope.selectCountryType = function(countryId) {
        if (countryId == 'US') {
            $scope.currentCountry = countryId;
            $scope.stateOrProvince = "State";
            $scope.zipOrPostal = "Zip";
        } else {
            $scope.currentCountry = countryId;
            $scope.stateOrProvince = "Province";
            $scope.zipOrPostal = "Postal";
        }
    }

    // CLOSE MODAL
    $scope.cancel = function() {
        $modalInstance.close();
    }

    //CREATE SUBSCRIBER PERSONAL INFO
    $scope.subscriberInfoCreate = function(theForm){
        if(theForm.$valid){
            WizardHandler.wizard().next();
        } else {
            $scope.errorMsg = 'Please ensure to complete all the required fields (*).';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);
        }
    } // CLOSE subscriberInfoCreate

    //CREATE SUBSCRIBER PERSONAL INFO
    $scope.subscriberPayCreate = function(theForm){
        if(theForm.$valid){
            var Query = {
                "FirstName":document.getElementById('subscriberFirstName').value,
                "LastName":document.getElementById('subscriberLastName').value,
                "Country":$scope.currentCountry,
                "Address1":document.getElementById('subscriberAddress').value,
                "Address2 ":document.getElementById('subscriberAddressApt').value,
                "City":document.getElementById('subscriberCity').value,
                "State ":document.getElementById('subscriberStateProv').value,
                "PostalCode":document.getElementById('subscriberZipPostal').value,
                "Email":document.getElementById('subscriberEmail').value,
                "Phone":document.getElementById('subscriberPhone').value,                
                "CardNumber":document.getElementById('subscriberPayCC').value,
                "ExpMonth":document.getElementById('subscriberPayCcMm').value,
                "ExpYear":document.getElementById('subscriberPayCcYy').value,
                "Cvv":document.getElementById('subscriberPayCvv').value,
            };
            
            $http({
              method:'POST',
              url: baseUrl + 'recurring/subscribers',
              data:Query
            }).success(function(data,status) {

                // ASSIGN ID FOR THE NEW SUBSCRIPTION
                $scope.SubscriberId = data.newSubscriberId;

                // GET SUBSCRIBERS AND PUSH DATA TO SUBSCRIPTION SERVICE
                $http.get(baseUrl + 'recurring/subscribers/'+ $scope.SubscriberId).success(function(data) {
                  Notify.sendMsg('NewSubscriber', data);
                });                

                //PROVIDE SUCESS MSG AND CLOSE MODAL
                $scope.successMsg = 'Subscriber created successful.';
                $('.successMsg').slideDown(500);
                $timeout(function() {
                    $('.successMsg').slideUp(500);
                    $modalInstance.close();
                },1500);

            }).error(function(data, status) {
                        
                //SOMETHING ERRONEOUS WITH THE API
                $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                $('.errorMsg').slideDown(500);
                $timeout(function() {
                    $('.errorMsg').slideUp(500);
                },3000);    
            });
            
        } else {

            //FORM ISNT FILLED OUT PROPERLY
            $VALID.errorMsg = 'Please ensure to complete all the required fields (*).';
            $('.errorMsg').slideDown(500);
            $timeout(function() {
                $('.errorMsg').slideUp(500);
            },3000);

        }
    } // CLOSE subscriberPayCreate
}  // END MODAL INSTANCE

//  SUBSCRIBER DELETE MODAL -- (REMOVE NOT DELETE STILL WILL BE IN DB)
app.controller('removeSubscriberModalCtrl', function($scope,$modal,$log) {
    $scope.open = function(index,subscriberId,lname) {

        var indexId = index;

        var modalInstance = $modal.open({
            templateUrl:'subscriberRemoveContent.html',
            controller:removeSubscriberCtrlInstance,
            size:'lg',
            resolve: {
                index:function() {
                    return indexId;
                },
                subscriberId:function() {
                    return subscriberId;
                },
                lname:function() {
                    return lname;
                }
            }
        });
    }
});

var removeSubscriberCtrlInstance = function($scope,$modalInstance,$log,index,subscriberId,lname,$http,baseUrl,Notify,$timeout) {
    //  CALLED REMOVE BECAUSE THE SUBSCRIBER WILL NEVER BE DELETED 
    //  WE WILL RETAIN THE USERS INFORMATION IN THE DB

    $scope.cancel = function() {
        $modalInstance.close();
    }

    $scope.subscriberLast = lname;

    $scope.removeSubscriber = function() {

        // REMOVE SUBSCRIBER
        $http({
            method:'DELETE',
            url:baseUrl + 'recurring/subscribers/' + subscriberId
        }).success(function(data,status) {

            //UPDATE VIEW
            Notify.sendMsg('RemoveSubscription', index);

            //SUCCESS MSG PRESENTED AND CLOSE MODAL
            $scope.successMsg = 'Subscriber has been deleted successfully.';
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

    }
}  //END OF SUBSCRIBER DELETE

//  SUBSCRIBER EDIT
app.controller('subscriberEditModalCtrl', function($scope,$modal,$log) {

    $scope.openIt = function(subscriberId) {
     var modalInstance = $modal.open({
        templateUrl:'subscriberCreateOrEditContent.html',
        controller:subscriberEditInstanceCtrl,
        size:'lg',
        resolve: {
            subscriberId:function() {
                return subscriberId;
            }
        }
     });
    }
});

//  SUBSCRIBER EDIT MODAL
var subscriberEditInstanceCtrl = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl,subscriberId) {
    // CLOSE MODAL
    $scope.cancel = function() {
        $modalInstance.close();
    }

    //COUNTRY CODES FOR SUBSCRIBER
    $scope.countries = $rootScope.countries;

    // GET LATEST FOR THIS SUBSCRIPTION
    $http.get( baseUrl + 'recurring/subscribers/' + subscriberId ).success(function(data) {
        console.log(data);
        $scope.subscriberFirstName = data.FirstName;
        $scope.subscriberLastName = data.LastName;
        $scope.currentCountry = data.Country;
        $scope.subscriberAddress = data.Address1;
        $scope.subscriberAddressApt = data.Address2;
        $scope.subscriberCity = data.City;
        $scope.subscriberStateProv = data.State;
        $scope.subscriberZipPostal = data.PostalCode;
        $scope.subscriberEmail = data.Email;
        $scope.subscriberPhone = data.Phone;


    /*
      $scope.subscription = data;      
      $scope.subscriptionFormName = $scope.subscription.DisplayName;
      $scope.subscriptionFormRecurringType = $scope.subscription.PlanType.Id; // calendar or days of cycle 
      $scope.subscriptionFormAmount = $scope.subscription.Amount;
      $scope.subscriptionFormCalDate = $scope.subscription.CalendarDayOrInterval;
      $scope.subscriptionEditCCAttempt = $scope.subscription.CreditCardMaxRetries;
      $scope.subscriptionEditCCAttemptLapse = $scope.subscription.DaysBetweenCardRetries;
      $scope.subscriptionEditACHAttempt = $scope.subscription.AchMaxRetries;
      $scope.subscriptionEditACHAttemptLapse = $scope.subscription.DaysBetweenAchRetries;
      $scope.subscriptionEditDeclinedEmail = $scope.subscription.DeclineNotificationRecipients;
    */

    }).error(function(data, status) {
                    
      //SOMETHING ERRONEOUS WITH THE API
      $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
      $('.errorMsg').slideDown(500);
      $timeout(function() {
          $('.errorMsg').slideUp(500);
      },4000);    
    });




        


}

app.controller('vterminalCtrl', function($rootScope,$scope,$http,$timeout,$state,$timeout, baseUrl) {

    //REFERENCE DETAILS UNIQUE IDENTIFIER
    $scope.createUniqueId = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    //BIND TO INPUT FIELD
    $scope.chargeRefnumber = $scope.createUniqueId();
    $scope.authRefnumber = $scope.createUniqueId();
    $scope.captureRefNumber = $scope.createUniqueId();
    $scope.udfAuthCount = 0;
    $scope.udfChargeCount = 0;
 
    // ADD UDF FIELDS UP TO 4
    $scope.addAuthUdf = function() {
        $scope.udfAuthCount++;
    }

    // ADD UDF FIELDS UP TO 4
    $scope.addChargeUdf = function() {
        $scope.udfChargeCount++;
    }
    // LOAD CURRENCIES - IN CASE USER HARD REFRESHES IN THIS PAGE
    if($scope.currencies.length == 0){
        $http.get(baseUrl + 'currencies').success(function(data) {
            $scope.currencies = data;
            $scope.chargeCurrency = $scope.currencies[0].Id;
            $scope.authCurrency = $scope.currencies[0].Id;
        });
    } else {
        $scope.chargeCurrency = $scope.currencies[0].Id;
        $scope.authCurrency = $scope.currencies[0].Id;
    }

    $scope.authType = 'Charge';
    
    // SUBMIT AUTHORIZATION FORM
    $scope.auth_form = {};
    $scope.authSubmit = function() {

        if($scope.auth_form.$valid) {
        
            var Query =  {
              "TransactionType": 4,
              "MidId": $scope.authMid,
              "Amount": +$scope.authAmount,
              "CurrencyId": $scope.authCurrency,
              "CardNumber": $scope.authCcNumber,
              "Cvv": $scope.authCvv,
              "ExpirationMonth": +$scope.authExpireMonth,
              "ExpirationYear": +$scope.authExpireYear,
              "FirstName": $scope.authFname,
              "LastName": $scope.authLname,
              "Email": $scope.authEmail,
              "Address1": $scope.authAddress,
              "City": $scope.authCity,
              "State": $scope.authState,
              "Country": $scope.authCountry,
              "Zip": $scope.authZip,
              "Phone": $scope.authPhone,
              "ReferenceNumber": $scope.authRefnumber,
              "Udf1": $scope.authUDF1,
              "Udf2": $scope.authUDF2,
              "Udf3": $scope.authUDF3,
              "Udf4": $scope.authUDF4
            }
        
        var promise = $http({
            method:'POST',
            url: baseUrl + 'vterminal',
            data:Query
        });

        promise.success(function(data,status) {

            // MASK Cvv #
            data.ApiRequest.Cvv = '*' + '*' + '*';

            $scope.payload = data.ApiResponse.ResultCode;
            $scope.Response = data.ApiResponse;
            $scope.Request = data.ApiRequest;
            $scope.RepStatus = data.ApiResponse.ResultCode;

            var Result = data.ApiResponse.ResultCode;
            // check success or fail of transaction
            if(Result === 0) {
                $scope.ResponseTxt = 'Success';
                $scope.repStatus = 0;
            } else  {
                $scope.ResponseTxt = 'Failed';
            }
            $scope.reqStatus = 0;
            $scope.RequestTxt = 'Success';
           
            console.log(data);

            $('.comm-panel').slideDown(300);         
        
        }).error(function(data,status) {
            //console.log(status);
            $scope.reqStatus = 'Failed';
            $scope.repStatus = 'Failed';

            $('.comm-panel').slideDown(300);

        }); 
        

        $('.virtual_panel').slideUp(300);
        $('.feedback').slideDown(300);

        } else {
          //FORM NOT COMPLETELY FILLED OUT
          $scope.errorMsg = 'Please ensure to fill in all required fields';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

        }
    } // END AUTHORIZATION FORM

    // SUBMIT CAPTURE FORM
    $scope.capture_form = {};
    $scope.captureSubmit = function() {
        
        if($scope.capture_form.$valid) {

            var Query = {
                "TransactionType":6,
                "PreviousTransactionNumber":$scope.captureTransNumber,
                "AuthorizationCode":$scope.captureAuthCode,
                "ReferenceNumber":$scope.captureRefNumber
            }

            // POST REQUEST
            var promise = $http({
                method:'POST',
                url: baseUrl + 'vterminal',
                data:Query
            });

            promise.success(function(data,status) {
                
                $scope.payload = data.ApiResponse.ResultCode;
                $scope.Response = data.ApiResponse;
                $scope.Request = data.ApiRequest;
                $scope.RepStatus = data.ApiResponse.ResultCode;

                var Result = data.ApiResponse.ResultCode;
                // check success or fail of transaction
                if(Result === 0) {
                    $scope.ResponseTxt = 'Success';
                    $scope.repStatus = 0;
                } else  {
                    $scope.ResponseTxt = 'Failed';
                }
                $scope.reqStatus = 0;
                $scope.RequestTxt = 'Success';
               
                console.log(data);

                $('.comm-panel').slideDown(300);

                // copy text
                $rootScope.copyData = data;
            
            }).error(function(data,status) {
                
                $scope.reqStatus = 'Failed';
                $scope.repStatus = 'Failed';

                $('.comm-panel').slideDown(300);

            });
            //////////////////
            
            $('.virtual_panel').slideUp(300);
            $('.feedback').slideDown(300);
            
        } else {
          //FORM NOT COMPLETELY FILLED OUT
          $scope.errorMsg = 'Please ensure to fill in all required fields';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

        }
    } // END CAPTURE FORM

    // SUBMIT CHARGE FORM
    $scope.charge_form = {};
    $scope.chargeSubmit = function() {

        if($scope.charge_form.$valid) {
       
            var Query =  {
              "TransactionType": 1,
              "MidId": $scope.chargeMid,
              "Amount": +$scope.chargeAmount,
              "CurrencyId": $scope.chargeCurrency,
              "CardNumber": $scope.chargeCcNumber,
              "Cvv": $scope.chargeCvv,
              "ExpirationMonth": +$scope.chargeExpireMonth,
              "ExpirationYear": +$scope.chargeExpireYear,
              "FirstName": $scope.chargeFname,
              "LastName": $scope.chargeLname,
              "Email": $scope.chargeEmail,
              "Address1": $scope.chargeAddress,
              "City": $scope.chargeCity,
              "State": $scope.chargeState,
              "Country": $scope.chargeCountry,
              "Zip": $scope.chargeZip,
              "Phone": $scope.chargePhone,
              "ReferenceNumber": $scope.chargeRefnumber,
              "Udf1": $scope.chargeUDF1,
              "Udf2": $scope.chargeUDF2,
              "Udf3": $scope.chargeUDF3,
              "Udf4": $scope.chargeUDF4
            }

            $http({
                method:'POST',
                url: baseUrl + 'vterminal',
                data:Query
            }).success(function(data,status) {
                // FOR DISPLAY IN COMMUNCATION DETAILS
                Query.CardNumber = '****************';
                Query.Cvv = '***';

                data.ApiRequest.Cvv = '*' + '*' + '*';

                $scope.payload = data.ApiResponse.ResultCode;
                $scope.Response = data.ApiResponse;
                $scope.Request = data.ApiRequest;
                $scope.RepStatus = data.ApiResponse.ResultCode;

                var Result = data.ApiResponse.ResultCode;

                // CHECK SUCCESS OR FAIL OF TRANSACTION
                if(Result === 0) {
                    $scope.ResponseTxt = 'Success';
                    $scope.repStatus = 0;
                } else  {
                    $scope.ResponseTxt = 'Failed';
                }
                $scope.reqStatus = 0;
                $scope.RequestTxt = 'Success';

                $('.comm-panel').slideDown(300);

            }).error(function(data,status) {
                // FOR DISPLAY IN COMMUNCATION DETAILS
                Query.CardNumber = '****************';
                Query.Cvv = '***';

                $scope.RequestTxt = 'Failed';
                $scope.Request = Query;
                
                $scope.ResponseTxt = 'Failed';
                $scope.Response = data;

                $scope.reqStatus = 'Failed';
                $scope.repStatus = 'Failed'
                $('.comm-panel').slideDown(300);

            });
          
            $('.virtual_panel').slideUp(300);
            $('.feedback').slideDown(300);
           
        } else {
            
          //FORM NOT COMPLETELY FILLED OUT
          $scope.errorMsg = 'Please ensure to fill in all required fields';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

        }
    } // end submit

    // submit REFUND FORM
    $scope.refundSubmit = function() {
        var Query = {
            "TransactionType":3,
            "PreviousTransactionNumber":$scope.refund_form.transNumber,
            "AuthorizationCode":$scope.refund_form.AuthCode,
            "Amount":$scope.refund_form.Amount,
            "ReferenceNumber": $scope.refund_form.refnumber
        }

        // POST REQUEST
        var promise = $http.post(baseUrl + 'transactions/' + Query.PreviousTransactionNumber + '/refund/' + Query.Amount)
            .success(function(data,status) {
                console.log(status);

                // POST REQUEST
                $scope.payload = data.ApiResponse.ResultCode;

                $scope.Response = data.ApiResponse;
                $scope.RepStatus = data.ApiResponse.ResultCode;

                var Result = data.ApiResponse.ResultCode;
                // check success or fail of transaction
                if(Result === 4) {
                    $scope.repStatus = 'Success';
                } else if (Result === 24) {
                    $scope.repStatus = 'Failed';
                }

                $('.comm-panel').slideDown(300);

                // copy text
            $rootScope.copyData = data;

        }).error(function(data,status) {
            console.log(status);

            $scope.repStatus = 'Failed'

            $('.comm-panel').slideDown(300);
        });

        $('.virtual_panel').slideUp(300);
        $('.feedback').slideDown(300);
    }

    // submit Void FORM
    $scope.voidSubmit = function() {
        var Query = {
            "TransactionType":2,
            "PreviousTransactionNumber":$scope.refund_form.transNumber,
            "AuthorizationCode":$scope.refund_form.AuthCode,
            "Amount":$scope.refund_form.Amount,
            "ReferenceNumber": $scope.refund_form.refnumber
        }

        // POST REQUEST
        var promise = $http.post(baseUrl + 'transactions/' + Query.PreviousTransactionNumber + '/void')
            .success(function(data,status) {
                console.log(status);

                // POST REQUEST
                $scope.payload = data.ApiResponse.ResultCode;

                $scope.Response = data.ApiResponse;
                $scope.RepStatus = data.ApiResponse.ResultCode;

                var Result = data.ApiResponse.ResultCode;
                // check success or fail of transaction
                if(Result === 4) {
                    $scope.repStatus = 'Success';
                } else if (Result === 24) {
                    $scope.repStatus = 'Failed';
                }

                $('.comm-panel').slideDown(300);

                // copy text
            $rootScope.copyData = data;

        }).error(function(data,status) {
            console.log(status);

            $scope.repStatus = 'Failed'

            $('.comm-panel').slideDown(300);
        });

        $('.virtual_panel').slideUp(300);
        $('.feedback').slideDown(300);
    } // end submit

    // RELOAD FORM
    $scope.reloadVirtual = function() {
        $state.go($state.$current, null, {reload: true });
    }

  // LOAD SUBSCRIBERS
  $http.get(baseUrl + 'recurring/subscribers').success(function(data) {
    $scope.subscribersBulk = data;
    $scope.subscribersBulkLength = data.length;
  });

  $scope.evaluateUdfCountAuth = function(value,index){
    if (value) {
        $scope.udfAuthCount = index;
    }
  }

  $scope.evaluateUdfCountCharge = function(value,index){
    if (value) {
        $scope.udfChargeCount = index;
    } 
  }

  $scope.selectExistingUser = function(subscriberSelection){
    if(subscriberSelection){
        //CHARGE DATA
        $scope.chargeFname = subscriberSelection.FirstName;
        $scope.chargeLname = subscriberSelection.LastName;
        $scope.chargeEmail = subscriberSelection.Email;
        $scope.chargeAddress = subscriberSelection.Address1;
        $scope.chargeCity = subscriberSelection.City;
        $scope.chargeState = subscriberSelection.State;
        $scope.chargeCountry = subscriberSelection.Country;
        $scope.chargeZip = subscriberSelection.PostalCode;
        $scope.chargePhone = subscriberSelection.Phone;

        $scope.udfChargeCount = 0;
        $scope.chargeUDF1 = subscriberSelection.Udf1;
        $scope.evaluateUdfCountCharge($scope.chargeUDF1,1);
        $scope.chargeUDF2 = subscriberSelection.Udf2;
        $scope.evaluateUdfCountCharge($scope.chargeUDF2,2);
        $scope.chargeUDF3 = subscriberSelection.Udf3;
        $scope.evaluateUdfCountCharge($scope.chargeUDF3,3);
        $scope.chargeUDF4 = subscriberSelection.Udf4;
        $scope.evaluateUdfCountCharge($scope.chargeUDF4,4);

        // AUTH DATA
        $scope.authFname = subscriberSelection.FirstName;
        $scope.authLname = subscriberSelection.LastName;
        $scope.authEmail = subscriberSelection.Email;
        $scope.authAddress = subscriberSelection.Address1;
        $scope.authCity = subscriberSelection.City;
        $scope.authState = subscriberSelection.State;
        $scope.authCountry = subscriberSelection.Country;
        $scope.authZip = subscriberSelection.PostalCode;
        $scope.authPhone = subscriberSelection.Phone;

        $scope.udfAuthCount = 0;
        $scope.authUDF1 = subscriberSelection.Udf1;
        $scope.evaluateUdfCountAuth($scope.authUDF1,1);
        $scope.authUDF2 = subscriberSelection.Udf2;
        $scope.evaluateUdfCountAuth($scope.authUDF2,2);
        $scope.authUDF3 = subscriberSelection.Udf3;
        $scope.evaluateUdfCountAuth($scope.authUDF3,3);
        $scope.authUDF4 = subscriberSelection.Udf4;
        $scope.evaluateUdfCountAuth($scope.authUDF4,4);
    } else {
        $scope.chargeFname = '';
        $scope.chargeLname = '';
        $scope.chargeEmail = '';
        $scope.chargeAddress = '';
        $scope.chargeCity = '';
        $scope.chargeState = '';
        $scope.chargeCountry = '';
        $scope.chargeZip = '';
        $scope.chargePhone = '';
        $scope.chargeUDF1 = '';
        $scope.chargeUDF2 = '';
        $scope.chargeUDF3 = '';
        $scope.chargeUDF4 = '';
        $scope.udfChargeCount = 0;

        // AUTH DATA
        $scope.authFname = '';
        $scope.authLname = '';
        $scope.authEmail = '';
        $scope.authAddress = '';
        $scope.authCity = '';
        $scope.authState = '';
        $scope.authCountry = '';
        $scope.authZip = '';
        $scope.authPhone = '';
        $scope.authUDF1 = '';
        $scope.authUDF2 = '';
        $scope.authUDF3 = '';
        $scope.authUDF4 = '';
        $scope.udfAuthCount = 0;
    }

  }






    $scope.modifyVt = function() {
        $('.virtual_panel').slideDown(300);
        $('.feedback').slideUp(300);
        $('.comm-panel').slideUp(300);
        // NEW UNIQUE IDENTIFIER NEEDED FOR PROCESSING
        $scope.chargeRefnumber = $scope.createUniqueId();
        $scope.authRefnumber = $scope.createUniqueId();
        $scope.captureRefNumber = $scope.createUniqueId();
    }
    
}); // virtualCtrl


app.controller('CommCtrl', function($scope) {
    
});
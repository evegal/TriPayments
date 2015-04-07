app.controller('vterminalCtrl', function($rootScope,$scope,$http,$timeout,$state,$timeout, baseUrl) {

    //REFERENCE DETAILS UNIQUE IDENTIFIER
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    //BIND TO INPUT FIELD
    $scope.chargeRefnumber = uuid;

    // LOAD CURRENCIES - IN CASE USER HARD REFRESHES IN THIS PAGE
    if($scope.currencies == undefined){
        $http.get(baseUrl + 'currencies').success(function(data) {
            $scope.currencies = data;
            $scope.chargeCurrency = $scope.currencies[0].Id;
        });
    }


    $scope.chargeFname = 'Brian';
    $scope.chargeLname = 'Phillips';
    //$scope.chargeMidGroup = 
    $scope.chargeAmount = 1;
    $scope.chargeCcNumber = 487093009704848;
    $scope.chargeCvv = 922;
    $scope.chargeExpireMonth = 1;
    $scope.chargeExpireYear = 2017;
    $scope.chargeEmail = 'dkontizas@gmail.com';
    $scope.chargeAddress = '1350 columbia st';
    $scope.chargeCity = 'San Diego';
    $scope.chargeState = 'CA';
    $scope.chargeCountry = 'USA';
    $scope.chargeZip = '92101';
    $scope.chargePhone = '6198864467';



    $scope.authType = 'Charge';
    
    // SUBMIT AUTHORIZATION FORM
    $scope.auth_form = {};
    $scope.submit = function() {

        if($scope.auth_form.$valid) {
        
        var Query =  {
          "TransactionType": 4,
          "MidGroupId": $scope.user.midGroup,
          "Amount": +$scope.user.amount,
          "CurrencyId": $scope.user.currency,
          "CardNumber": $scope.user.ccNumber,
          "Cvv": $scope.user.Cvv,
          "ExpirationMonth": +$scope.user.ExpireMonth,
          "ExpirationYear": +$scope.user.ExpireYear,
          "FirstName": $scope.user.fname,
          "LastName": $scope.user.lname,
          "Email": $scope.user.email,
          "Address1": $scope.user.address,
          "City": $scope.user.city,
          "State": $scope.user.state,
          "Country": $scope.user.country,
          "Zip": $scope.user.zip,
          "Phone": $scope.user.phone,
          "ReferenceNumber": $scope.user.refnumber
        }
        
        console.log(Query);
        //$scope.Request = Query;
        
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

            // copy text
            $rootScope.copyData = data;
           
        
        }).error(function(data,status) {
            //console.log(status);

            $scope.reqStatus = 'Failed';
            $scope.repStatus = 'Failed';

            $('.comm-panel').slideDown(300);

        }); 
        

        $('.virtual_panel').slideUp(300);
        $('.userSearch').slideDown(300);

        } else {
        $('.userError').slideDown(300);

        $timeout(function() {
            $('.userError').slideUp(300);
        },1000);
        }
    } // END AUTHORIZATION FORM

    // SUBMIT CAPTURE FORM
    $scope.capture_form = {};
    $scope.captureSubmit = function() {
        
        if($scope.capture_form.$valid) {

            var Query = {
                "TransactionType":6,
                "PreviousTransactionNumber":$scope.user.TransNumber,
                "AuthorizationCode":$scope.user.AuthCode,
                "ReferenceNumber":$scope.user.RefNumber
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
            $('.userSearch').slideDown(300);
            
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
              "MidGroupId": $scope.chargeMidGroup,
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
              "ReferenceNumber": $scope.chargeRefnumber
            }

            console.log(Query);
               
            var promise = $http({
                method:'POST',
                url: baseUrl + 'vterminal',
                data:Query
            });

            promise.success(function(data,status) {

                conole.log(data);

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

                $('.comm-panel').slideDown(300);

                // copy text
                $rootScope.copyData = data;

            }).error(function(data,status) {
                console.log(status);

                $scope.reqStatus = 'Failed';
                $scope.repStatus = 'Failed'
                $('.comm-panel').slideDown(300);


            });
           

            $('.virtual_panel').slideUp(300);
            $('.userSearch').slideDown(300);
            
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
        $('.userSearch').slideDown(300);
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
        $('.userSearch').slideDown(300);


    } // end submit

    // Reload Form
    $scope.reloadVirtual = function() {
        $state.go($state.$current, null, {reload: true });
    }


    // COPY TO CLIPBOARD
     $scope.getTextToCopy = function() {
        return JSON.stringify($rootScope.copyData);
    }
    $scope.doSomething = function() {
        //console.log(JSON.stringify($rootScope.copyData));
    }
    /*
    $scope.getTextToCopy = function() {
        return "ngClip is cool";
    }
    $scope.doSomething = function() {
        console.log('text copied');
    }
    */
    
    // TOGGLE COMM PANEL TEXT
    $scope.toggleText = function() {

        var txt = $('.comm-details').is(':visible') ? "Show Communication Details" : "Hide Communication Details";
        $('a.toggleComm').text(txt);

    }

    
}); // virtualCtrl


app.controller('CommCtrl', function($scope) {
    
});
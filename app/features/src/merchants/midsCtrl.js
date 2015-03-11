app.controller('midsCtrl', function($scope,$http,Notify) {

    $scope.showRolloverParents = function(mid) {

        if(mid) {
            var parents = mid.RolloverParents;
            var parentNames = [];

            for(var i in parents) {
                if(parents.hasOwnProperty(i)) {
                    parentNames.push(parents[i]);
                }
            }

            $scope.rollGroups = parentNames;
            // log results
            return parentNames.length;
        }
    }   

    

    
    $scope.findPayType = function(mid) {

        if(mid) {

            var payments = mid.PaymentTypeIds;

            //$scope.payments = '<i class="fa fa-cc-discover fa-2x"></i>' + '<i class="fa fa-cc-visa fa-2x"></i>' + '<i class="fa fa-cc-amex fa-2x"></i>';
            //console.log(mid.PaymentTypes);
            


            $scope.cards = [];
            $scope.payments = '';

            for(var prop in mid.PaymentTypes) {
                var result = mid.PaymentTypes[prop];
                $scope.cards.push(result);
            }

            
            for(var i=0;i<$scope.cards.length;i++) {
                //console.log($scope.cards[i]);
                if($scope.cards[i] === 'Discover') {
                    $scope.payments += '<i class="fa fa-cc-discover fa-2x"></i>';
                }
                if($scope.cards[i] === 'Visa') {
                    $scope.payments += '<i class="fa fa-cc-visa fa-2x"></i>';
                }
                if($scope.cards[i] == 'Mastercard') {
                    $scope.payments += '<i class="fa fa-cc-mastercard fa-2x"></i>';
                }
                if($scope.cards[i] == 'American Express') {
                    $scope.payments += '<i class="fa fa-cc-amex fa-2x"></i>';   
                }
            }

        }

    }
});

app.controller('midEditModalCtrl', function($scope,$modal,$log) {
    $scope.openIt = function(mid) {
     var modalInstance = $modal.open({
        templateUrl:'midsModalContent.html',
        controller:midEditInstanceCtrl,
        size:'lg',
        resolve: {
            mid:function() {
                return mid;
            }
        }
     });
    }
});

//  MID EDIT MODAL
var midEditInstanceCtrl = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl,mid) {
    // GET CURRENT VALUES FOR MID
    $http.get(baseUrl + 'mids/' + mid.Id).success(function(data) {
        $scope.original = data;
        $scope.dataPresent = data;

        $scope.MIDconfig = $scope.dataPresent.Mid;
        $scope.MIDdescriptor = $scope.dataPresent.Descriptor;
        $scope.MIDdisplayName = $scope.dataPresent.CrmDisplayName;
        $scope.MIDmonthlyCap = $scope.dataPresent.MonthlyCap;
        $scope.MIDlimitType = $scope.dataPresent.LimitType;
        $scope.MIDdailyRebill = $scope.dataPresent.DailyRebillProcessingLimit;
        $scope.MIDtransactionFee = $scope.dataPresent.TransactionFee;
        $scope.MIDchargeBackFee = $scope.dataPresent.ChargebackFee;
        $scope.MIDreserveAccountRate = $scope.dataPresent.ReserveAccountRate;
        $scope.MIDiscount = $scope.dataPresent.RetailDiscountRate;
        
        // api is passing a null value versus a 0 like the rest of the fields.
        if($scope.dataPresent.GatewayFeeRetail == null ){
            $scope.MIDgatewayFee= 0;
        } else {
            $scope.MIDgatewayFee = $scope.dataPresent.GatewayFeeRetail;
        }
       
        // PAYMENT CHECKBOXES
        angular.forEach($scope.dataPresent.PaymentTypes, function(value,key) {
            $scope[ value.Name ] = true;
        });

        // CURRENCY CHECKBOXES
        angular.forEach($scope.dataPresent.Currrencies, function(value,key) {
            $scope[ value.Currency ] = true;
        });
    });
        
    $scope.editMidConfig = function(theForm) {
        if(theForm.$valid && theForm.$dirty) {

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

            var Query = {
                "Mid":document.getElementById('MIDconfig').value,
                "Descriptor":document.getElementById('MIDdescriptor').value,
                "DisplayName":document.getElementById('MIDdisplayName').value,
                "MonthlyCap":+document.getElementById('MIDmonthlyCap').value,
                "PaymentTypeIds":$scope.paymentTypes,
                "CurrencyIds":$scope.currencyTypes,
                "limitType":document.getElementById('limitType').value,
                "DailyRebillProcessingLimit":+document.getElementById('dailyRebill').value,
                "TransactionFee":+document.getElementById('MIDtransactionFee').value,
                "ChargebackFee":+document.getElementById('MIDchargeBackFee').value,
                "ReserveAccountRate":+document.getElementById('MIDreserveAccountRate').value,
                "RetailDiscountRate":+document.getElementById('MIDiscount').value,
                "GatewayFeeRetail":+document.getElementById('MIDgatewayFee').value             
            };

            $http({
                method:'PUT',
                url: baseUrl + 'mids/' + mid.Id,
                data:Query
            }).success(function(data,status) {
                Notify.sendMsg('NewMidUpdate', data);

                $scope.successMsg = 'Update Successful.';
                $('.successMsg').slideDown(500);
                $timeout(function() {
                    $('.successMsg').slideUp(500);
                    WizardHandler.wizard().next();
                },1500);
                
            });
        } else {
            WizardHandler.wizard().next();
        }
           
    //GET ALL EMAIL FOR NOTIFICATION
    $http.get(baseUrl + 'mids/' + mid.Id + '/notifications').success(function(data) {
        
        $scope.emailData = data;
        console.log($scope.emailData);
        //VERIFY PRE-EXISTING EMAILS TO DISPLAY TABLE
        $scope.emailExist = ($scope.emailData.length > 0 ? true : false);
    });
   
    $scope.emailData = [];
    $scope.addEditEmail = function() {

        var userEmail = document.getElementById('notificationEmail').value,
            notificationType = [2];
              
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if(notificationType != '' ){

                if(re.test(userEmail)) {
                    var Query = {
                        "MidId":mid.Id,
                        "Recipient":userEmail,
                        "NotificationTypeIds":notificationType
                    }
                  
                    $http({
                        method:'POST',
                        url:baseUrl + 'mids/setup/notifications',
                        data:Query
                    }).success(function(data,status) {
                        console.log(data);
                        $scope.emailExist = true;
                        // push to emails Array
                        $scope.emailData.push(Query);
                        $scope.emailAdded = true;
                    });

                    // CLEAR INPUTS
                    document.getElementById('notificationEmail').value = '';

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

    $scope.removeEditEmail = function(email, index) {

        var midId = mid.Id,
            Query = {
                "MidId":midId,
                "Recipient":email
            };

        console.log(Query);

        $http({
            method:'DELETE',
            url:baseUrl + 'mids/'+ midId +'/notifications/' + email ,
            data:Query
        }).success(function(data,status) {
            console.log(status);
            console.log(data);
            $scope.emailData.splice(index,1);
            $scope.emailExist = ($scope.emailData.length == 0 ? false : true);
            console.log($scope.emailExist);
        });
    }

    //MID STEP 3 ADD NOTIFICATION EMAILS TO MID
    $scope.midEditNotifyEmail = function() {
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


    //MID VERIFY DATA FOR VIEW 
    $scope.MidConfig = document.getElementById('MIDconfig').value;
    $scope.Descriptor = document.getElementById('MIDdescriptor').value;
    $scope.DisplayName = document.getElementById('MIDdisplayName').value;
    $scope.MonthlyCap = document.getElementById('MIDmonthlyCap').value;
    $scope.IsActive = $scope.dataPresent.IsActive;

    $scope.midStep15 = function() {
       
        var Query =  {
            "MidId":mid.Id
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
        

    } // END verify
    

    }

    
    // CLOSE MODAL
    $scope.cancel = function() {
        $scope.mid = $scope.original;

        $modalInstance.close();

    }

    $scope.updateMID = function(mid) {

        //console.log($scope.mid);

    }

    // ROLLOVERS
    /*
    $http.get(baseUrl + 'midgroups/' + $rootScope.currentGroupId + '/mids/' + mid.Id + '/available-rollovers').success(function(data) {
        $scope.rollOver = data;
    });
    */
}

//  MID REMOVE MODAL
app.controller('removeMidModal', function($scope,$modal,$log) {
    $scope.open = function(index,mid) {
        var modalInstance = $modal.open({
            templateUrl:'RemoveMidContent.html',
            controller:removeMidCtrlInstance,
            size:'lg',
            resolve: {
                mid:function() {
                    return mid;
                },
                index:function() {
                    return index;
                }
            }
        });
    }
});

var removeMidCtrlInstance = function($scope,$modalInstance,$log,index,mid,$http,baseUrl,Notify,$timeout) {
    $scope.mid = mid;

    $scope.cancel = function() {
        $modalInstance.close();
    }

    $scope.removeMID = function() {

        // REMOVE MID
        $http({
            method:'DELETE',
            url:baseUrl + 'mids/' + mid.Id 
        }).success(function(data,status) {

            Notify.sendMsg('removedMid', index);

            console.log(data);
            
            $('.userCreateSuccess').show();

            $timeout(function() {
                $modalInstance.close();
            },500);

        });

    }
}


//  MID DISABLE MODAL
app.controller('DeleteMidCtrl', function($scope,$modal,$log) {
    $scope.openMID = function(index,mid) {
        var modalInstance = $modal.open({
            templateUrl:'DeleteMidContent.html',
            controller:DeleteMidCtrlInstance,
            size:'lg',
            resolve: {
                mid:function() {
                    return mid;
                },
                index:function() {
                    return index;
                }
            }
        });
    }
});

var DeleteMidCtrlInstance = function($scope,$modalInstance,$log,mid,$http,Notify,index,$timeout,baseUrl) {

    $scope.mid = mid;
    console.log(mid);

    $scope.cancel = function() {
        $modalInstance.close();
    }

    var newQuery = {"enabled":false};

    $scope.disableMID = function() {


        console.log('Disabling MID');
        
        $http({
            method:'PATCH',
            url: baseUrl + 'mids/' + mid.Id,
            data:newQuery
        }).success(function(data,status) {
            
            console.log('STATUS: ' + status + ' DATA: ' + data);

            Notify.sendMsg('DeleteMid', index);

            $('.userCreateSuccess').show();

            $timeout(function() {
                $modalInstance.close();
            },500);


        });
        
        
        
        
    }

}

//  MID ENABLE MODAL
app.controller('EnableMidCtrl', function($scope,$modal,$log) {
    $scope.open = function(index,mid) {
        var modalInstance = $modal.open({
            templateUrl:'EnableMidContent.html',
            controller:EnableMidCtrlInstance,
            size:'lg',
            resolve: {
                mid:function() {
                    return mid;
                },
                index:function() {
                    return index;
                }
            }
            
        });
    }
});

var EnableMidCtrlInstance = function($scope,$modalInstance,$log,mid,$http,Notify,index,$timeout,baseUrl) {

    $scope.mid = mid;
    console.log(mid);

    $scope.cancel = function() {
        $modalInstance.close();
    }

    var newQuery = {"enabled":"true"}
    $scope.enableMID = function() {

        $http({
            method:'PATCH',
            url: baseUrl + 'mids/' + mid.Id,
            data:newQuery
        }).success(function(data,status) {
            
            console.log(status);
            console.log(data);

            Notify.sendMsg('DeleteMid', index);

            $('.userCreateSuccess').show();

            $timeout(function() {
                $modalInstance.close();
            },500);

        });

    }

}

//  MID CREATION MODAL
app.controller('midCreateModal', function($scope,$modal,$log) {
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl:'midCreateContent.html',
            controller:midCreateModalInstance,
            size:'lg'
        });
    }
});

var midCreateModalInstance = function($scope,$modalInstance,$log,$http,$rootScope,WizardHandler,$timeout,Notify,baseUrl) {

    console.log('mid create');

    $http.get(baseUrl + 'gateways/processors').success(function(data) {
        $scope.processors = data;
    });

    $scope.Groups = $rootScope.modalGroups

    $scope.currentGateways = [];

    // GET CURRENT USER GATEWAYS
    $http.get(baseUrl + 'gateways/current').success(function(data) {
        $scope.curGates = data;

        console.log(data);


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

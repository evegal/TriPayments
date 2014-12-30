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

    

    
    $scope.doShit = function(mid) {

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

app.controller('editMidModalCtrl', function($scope,$modal,$log) {
    $scope.openIt = function(mid) {
     var modalInstance = $modal.open({
        templateUrl:'midsModalContent2.html',
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

var midEditInstanceCtrl = function($scope,$modalInstance,mid,$rootScope,$http,baseUrl) {

    // MID TO EDIT
    //$scope.mid = mid;
    $scope.original = mid;
    $scope.copyCat = angular.copy(mid);
    $scope.mid = $scope.copyCat;

    
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

///////////////////////////
//  MID REMOVE MODAL
///////////////////////////
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



///////////////////////////
//  MID DISABLE MODAL
///////////////////////////
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

///////////////////////////
//  MID ENABLE MODAL
///////////////////////////
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

///////////////////////////
//  MID CREATION MODAL
///////////////////////////

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

    $http.get(baseUrl + 'gateways/processors').success(function(data) {
        //console.log(data);
        $scope.processors = data;
    });

    $scope.Groups = $rootScope.modalGroups

    $scope.currentGateways = [];

    // GET CURRENT USER GATEWAYS
    $http.get(baseUrl + 'gateways/current').success(function(data) {
        $scope.curGates = data;
        //console.log(data);

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

    } // selectUpdate



    // GET PAYMENT TYPES
    
    $http.get( baseUrl + 'mids/paymentTypes').success(function(data) {
        
        angular.forEach(data, function(value,key) {
            //console.log(data[key]);
        });

    });
    



    // Checkbox 'unchecked' by default
    $scope.preExist = false;

    

    $scope.midStep1 = function(theForm,selectedMerchant,selectedPro) {

        if(theForm.$valid) {
       
            var Query = {
            "GatewayId":selectedMerchant,
            "MerchantCompany":document.getElementById('MerchantCompany').value,
            "GatewayUsername":document.getElementById('Merchant.UserNamegate').value,
            "GatewayPassword":document.getElementById('Merchant.Passwordgate').value,
            "GatewayType":document.getElementById('GatewayType').value,
            "IsActive":document.getElementById('steponeActive').checked
           }
           
           
           // get actual txt of dropdown not just id 
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

    $scope.midStep12 = function(theForm) {


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
        
        
    } // END midStep12

    ///////////////////
    //  STEP 2
    //////////////////
    $scope.midStep13 = function(theForm) {


        if(theForm.$valid) {

            $scope.paymentTypes = [];

            // bind card checkboxes
            var amexType = +document.getElementById('amerExpress-box').checked;
            var visaType = +document.getElementById('visa-box').checked;
            var masterType = +document.getElementById('mastercard-box').checked;
            var discoverType = +document.getElementById('discover-box').checked;

            if(amexType) {
                var amex = 1;
                $scope.paymentTypes.push(amex);
            } 

            if(visaType) {
                var visa = 2;
                $scope.paymentTypes.push(visa);
            } 

            if(masterType) {
                var master = 3;
                $scope.paymentTypes.push(master);
            } 

            if(discoverType) {
                var master = 4;
                $scope.paymentTypes.push(master);
            } 

            var checkP = [];
            checkP.push(amexType,visaType,masterType,discoverType);

            //console.log(checkP);
            for(var i=0;i<checkP.length;i++) {
                if(checkP[i] === 1) {
                    var cardSelectCheck = true;
                }
            }
           
            // parse MonthyCap 
            var monthlyCapAmt =  parseFloat(document.getElementById('MIDmonthlyCap').value);

            var Query = {
                "limitType":document.getElementById('limitType').value,
                "DailyRebillProcessingLimit":+document.getElementById('dailyRebill').value,
                "Mid":document.getElementById('MIDconfig').value,
                "Descriptor":document.getElementById('MIDdescriptor').value,
                "DisplayName":document.getElementById('MIDdisplayName').value,
                "MonthlyCap":monthlyCapAmt,
                "PaymentTypeIds":$scope.paymentTypes,
                "GatewayId":$scope.gatewayId,
                "MerchantGatewayId":$scope.NewExistGateway,
                "GatewayFeeRetail":document.getElementById('MIDgatewayFee').value,
                "TransactionFee":document.getElementById('MIDtransactionFee').value,
                "ChargebackFee":document.getElementById('MIDchargeBackFee').value,
                "ReserveAccountRate":document.getElementById('MIDreserveAccountRate').value,
                "RetailDiscountRate":document.getElementById('MIDiscount').value
            };

            $scope.Descriptor = document.getElementById('MIDdescriptor').value;
            $scope.MidConfig = document.getElementById('MIDconfig').value;
            $scope.DisplayName = document.getElementById('MIDdisplayName').value;
            $scope.MonthlyCap = document.getElementById('MIDmonthlyCap').value;

                //if cards have been selected proceed
                if(cardSelectCheck) {
                    //is this a new mid then post
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
                            //console.log($scope.newMidId); // logs INT

                        });

                    //Not new patch
                    } else {
                        console.log($scope.newMidId);
                        console.log('not new MID ');
                        Query.MidId = $scope.newMidId;

                        console.log('newQuery');
                        console.log(Query);

                        
                        $http({
                            method:'PUT',
                            url: baseUrl + 'mids/' + $scope.newMidId,
                            data:Query
                        }).success(function(data,status) {
                            
                            Notify.sendMsg('NewMidUpdate', data);

                            //$scope.newMidId = data.newMidId;
                            //console.log($scope.newMidId);
                            WizardHandler.wizard().next();
                            //console.log($scope.newMidId); // logs INT

                        });
                        

                    }
                


                } else {
                    $scope.errorMsg = 'Please select the payment types';
                    $('.errorMsg').slideDown(500);
                    $timeout(function() {
                        $('.errorMsg').slideUp(500);
                    },2500);
                }
            
            

             } else {
                $scope.errorMsg = 'Please ensure that the required fields (*) are entered.';
                $('.errorMsg').slideDown(500);
                $timeout(function() {
                    $('.errorMsg').slideUp(500);
                },3000);
             }
        
        
        


    }

    ////////////
    //  STEP 3
    ////////////
    $scope.emails = [];


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
        
    }    
    
    $scope.addEmail = function() {

        var userEmail = document.getElementById('notificationEmail').value,
            allEmail = document.getElementById('allEmailTypes').checked,
            orderConfirm = document.getElementById('orderConfirm').checked,
            shipment = document.getElementById('shipment').checked,
            refundCheck = document.getElementById('refundCheck').checked,
            notificationType = [];

        if(allEmail) {
            notificationType.push(1);
        }
        if(orderConfirm) {
            notificationType.push(2);
        }
        if(shipment) {
            notificationType.push(3);
        }
        if(refundCheck) {
            notificationType.push(4);
        }
   
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if(notificationType != '' ){


                if(re.test(userEmail)) {
                    // push to emails Array
                    $scope.emails.push(userEmail);

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
                        console.log(status);
                        console.log(data);

                    });

                    // clear input
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

    
    $scope.midStep14 = function(theForm) {
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
    }

    ////////////////////
    //  STEP 4 - VERIFY
    ////////////////////
    $scope.midStep15 = function() {
       
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
        

    } // END verify

    

}  // END MODAL INSTANCE

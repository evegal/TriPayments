app.controller('midsCtrl', function($scope,$http,Notify) {

    /*
    $scope.setGroups = function(mid) {
            var Glen = mid.GroupMembership;
            var bucket = [];   
            var groupNames = [];     

            var stuff = [];
            // Dynamic PopOver
            //$scope.dynamicPop = mid.GroupMembership;

            for(var i in mid.GroupMembership) {
                bucket.push(i);

                if(mid.GroupMembership.hasOwnProperty(i)) {
                    //onsole.log(i + " =  " + mid.GroupMembership[i])

                    groupNames.push(mid.GroupMembership[i]);

                }

            }

            $scope.dynamicPop = groupNames;
            //$scope.groupTip = groupNames;
            $scope.tempGroups = groupNames;

            $scope.groupTip = groupNames;

            //$scope.groupTip = '<p>somegroup</p>';

            return bucket.length;
    } // END setGroups
    */


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
            method:'PUT',
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
        console.log('theForm: ' + theForm);
        console.log('selectedMerchant: ' + selectedMerchant);
        console.log('selectedPro: ' + selectedPro);

        if(theForm.$valid) {
       
            var Query = {
            "GatewayId":selectedMerchant,
            "MerchantCompany":document.getElementById('MerchantCompany').value,
            "GatewayUsername":document.getElementById('Merchant.UserNamegate').value,
            "GatewayPassword":document.getElementById('Merchant.Passwordgate').value,
            "GatewayType":document.getElementById('GatewayType').value,
            "IsActive":document.getElementById('steponeActive').checked
           }
           
           //$scope.gatewayId = +document.getElementById('GatewayId').value
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
            
            $scope.wrongInput = 'Please Complete New Merchant Form';
            $('.nameError').slideDown(500);
            $timeout(function() {
                $('.nameError').slideUp(500);
            },2500);

        }
    } // END midstep1

    $scope.midStep12 = function(theForm,curGate) {

        /*
        var Query =  {
            "ExistingMerchantGatewayId":+document.getElementById('curGates').value,
            "IsActive":true
        }
        */

        if(theForm.$valid) {

        var Query = {
          "ExistingMerchantGatewayId":curGate,  
          "IsActive": true
        }

        
        $http({
            method:'POST',
            url: baseUrl + 'setup/gateway',
            data:Query
        }).success(function(data) {
            console.log(data);

            $scope.NewExistGateway = data.newMerchantGatewayId;
            $scope.gatewayId = data.gatewayId;
            
            WizardHandler.wizard().next();

        });
        
        } else {
            $scope.emptyField = 'Please Make A Selection';
            $('.nameError').slideDown(500);
            $timeout(function() {
                $('.nameError').slideUp(500);
            },2500);
        }       
        
        
    } // END midStep12

    ///////////////////
    //  STEP 2
    //////////////////
    $scope.midStep13 = function(theForm) {

        //console.log($scope.gatewayId);
        //console.log(theForm);
        if(theForm.$valid) {

        $scope.paymentTypes = [];

        var amexType = +document.getElementById('amerExpress-box').checked;
        var visaType = +document.getElementById('visa-box').checked;
        var masterType = +document.getElementById('mastercard-box').checked;
        var discoverType = +document.getElementById('discover-box').checked;

        if(amexType) {
            var amex = 1;
            $scope.paymentTypes.push(amex);
        } else {
            //console.log('amex not set');
        }

        if(visaType) {
            var visa = 2;
            $scope.paymentTypes.push(visa);
        } else {
            //console.log('visa not set');
        }

        if(masterType) {
            var master = 3;
            $scope.paymentTypes.push(master);
        } else {
            //console.log('master not set');
        }

        if(discoverType) {
            var master = 4;
            $scope.paymentTypes.push(master);
        } else {
                //console.log('master not set');
        }

        var checkP = [];
        checkP.push(amexType,visaType,masterType,discoverType);

        //console.log(checkP);
        for(var i=0;i<checkP.length;i++) {
            //console.log(checkP[i]);
            if(checkP[i] === 1) {
                var itCheck = true;
            }
        }

        

        // check paymentTypes
        //console.log($scope.paymentTypes);


        /*
        var Query = {
            "Mid":document.getElementById('MIDconfig').value,
            "Descriptor":document.getElementById('MIDdescriptor').value,
            "DisplayName":document.getElementById('MIDdisplayName').value,
            "MonthlyCap":+document.getElementById('MIDmonthlyCap').value,
            "TransactionFee":+document.getElementById('MIDtransactionFee').value,
            "ChargebackFee":+document.getElementById('MIDchargeBackFee').value,
            "ReserveAccountRate":+document.getElementById('MIDreserveAccountRate').value,
            "RetailDiscountRate":+document.getElementById('MIDiscount').value
        }
        */

        
        var Query = {
            "limitType":document.getElementById('limitType').value,
            "DailyRebillProcessingLimit":+document.getElementById('dailyRebill').value,
            "Mid":document.getElementById('MIDconfig').value,
            "Descriptor":document.getElementById('MIDdescriptor').value,
            "DisplayName":document.getElementById('MIDdisplayName').value,
            "MonthlyCap":+document.getElementById('MIDmonthlyCap').value,
            "PaymentTypeIds":$scope.paymentTypes,
            "gatewayId":$scope.gatewayId,
            "merchantGatewayId":$scope.NewExistGateway,
            "TransactionFee":+document.getElementById('MIDtransactionFee').value,
            "ChargebackFee":+document.getElementById('MIDchargeBackFee').value,
            "ReserveAccountRate":+document.getElementById('MIDreserveAccountRate').value,
            "RetailDiscountRate":+document.getElementById('MIDiscount').value
        };

        $scope.Descriptor = document.getElementById('MIDdescriptor').value;
        $scope.MidConfig = document.getElementById('MIDconfig').value;
        $scope.DisplayName = document.getElementById('MIDdisplayName').value;
        $scope.MonthlyCap = +document.getElementById('MIDmonthlyCap').value;

        if(itCheck) {
            console.log('found it');
         
        
        $http({
            method:'POST',
            url: baseUrl + 'mids/setup/mid',
            data:Query
        }).success(function(data,status) {
            
            Notify.sendMsg('NewMidCreated', data);

            $scope.newMidId = data.newMidId;
            console.log($scope.newMidId);
            WizardHandler.wizard().next();
            //console.log($scope.newMidId); // logs INT

        });

        } else {
            $scope.wrongInput = 'Please Enter A Payment Type';
            $('.nameError').slideDown(500);
            $timeout(function() {
                $('.nameError').slideUp(500);
            },2500);
        }
        
        

         } else {
            $scope.wrongInput = 'Please Make A Selection';
            $('.nameError').slideDown(500);
            $timeout(function() {
                $('.nameError').slideUp(500);
            },2500);
         }
        
        
        


    }

    ////////////
    //  STEP 3
    ////////////
    $scope.emails = [];

    $scope.addEmail = function() {

        var userEmail = document.getElementById('notificationEmail').value;

    
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            //console.log(re.test(userEmail));
            if(re.test(userEmail)) {
                // push to emails Array
                $scope.emails.push(userEmail);
                // clear input
                document.getElementById('notificationEmail').value = '';

            } else {
                //alert('Please Enter Valid Email');
                $scope.wrongInput = 'Please Enter A Valid Email';
                $('.nameError').slideDown(500);
                $timeout(function() {
                    $('.nameError').slideUp(500);
                },2500);
            }        

    }

    $scope.removeEmail = function(index) {
        //console.log(index);

        $scope.emails.splice(index,1);
    }

    
    $scope.allTypeChange = function() {
        var parentCheck = document.getElementById('allEmailTypes').checked;

        if(parentCheck) {
            //document.getElementById('orderConfirm').checked = true;
            //document.getElementById('shipment').checked = true;
            document.getElementById('refundCheck').checked = true;
            document.getElementById('capToggle').checked = true;

            $scope.capToggle = true;

        } else {
            //document.getElementById('orderConfirm').checked = false;
            //document.getElementById('shipment').checked = false;
            document.getElementById('refundCheck').checked = false;
            document.getElementById('capToggle').checked = false;

            $scope.capToggle = false;
        }
        
    }

    $scope.midStep14 = function(theForm) {


        var allEmail = document.getElementById('allEmailTypes').checked;
        //var orderConfirm = document.getElementById('orderConfirm').checked;
        //var shipment = document.getElementById('shipment').checked;
        var refundCheck = document.getElementById('refundCheck').checked;

        if(allEmail) {
            var notificationType = 1;
        }
        /*
        if(orderConfirm) {
            var notificationType = 2;
        }
        if(shipment) {
            var notificationType = 3;
        }
        */

        if(refundCheck) {
            var notificationType = 4;
        }



        var Query = {
            "MidId":$scope.newMidId,
            "Recipients":$scope.emails,
            "NotificationTypeId":notificationType
        }

        console.log(Query);

        
        $http({
            method:'POST',
            url:baseUrl + 'mids/setup/notifications',
            data:Query
        }).success(function(data,status) {
            console.log(status);
            console.log(data);

            // NEXT STEP
            WizardHandler.wizard().next();
        });
        
        
        

    }

    ////////////////////
    //  STEP 4 - VERIFY
    ////////////////////
    $scope.midStep15 = function() {
        console.log($scope.newMidId);
        
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

            if(data === 'false') {
                //$scope.verfiyFail = 'Verification Failed';
                $('.nameError').slideDown(500);
                $timeout(function() {
                    $('.nameError').slideUp(500);
                },2500);

            } else if(data === 'true') {
                
                $('.verify_btn').hide();
                $('.userCreateSuccess').show();
            }

        });
        

    } // END verify

    

}  // END MODAL INSTANCE

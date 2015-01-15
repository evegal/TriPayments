app.controller('searchCtrl', function($rootScope,$scope,$http,$filter,baseUrl,$state,$moment,Notify) {

  
  /////////////////
  // SINGLE SEARCH 
  /////////////////


  // Set Default for Search Type 
  $scope.searchType = 'single';
  $('.single_format').addClass('activeFormat');


  
  // Toggle to single search format
  $scope.singleFormat = function() {
    $scope.searchType = 'single';
    // SWAP ACTIVE CLASS
    $('.single_format').addClass('activeFormat');
    $('.group_format').removeClass('activeFormat');
  };

  // Toggle to group search format
  $scope.groupFormat = function() {
    $scope.searchType = 'group';
    // SWAP ACTIVE CLASS
    $('.group_format').addClass('activeFormat');
    $('.single_format').removeClass('activeFormat');
  };

  // cache form for query and to clear input fields
  $scope.search_form = {};
  // Handle Form Submit
  $scope.submit = function() {

    //set todays date if dates not defined
    if ($scope.search_form.fromDate == undefined){$scope.search_form.fromDate = new Date();}
    if ($scope.search_form.toDate == undefined){$scope.search_form.toDate = new Date();}

    // Date formating
    var datefilter = $filter('date'),
        formatDate = datefilter($scope.search_form.fromDate,'MM/dd/yy'),
        formatDate2 = datefilter($scope.search_form.toDate, 'MM/dd/yy');
    
    // Create Query Object for POST request to Endpoint
    var formQuery =  {
            "FirstName": $scope.search_form.fname,
            "LastName": $scope.search_form.lname,
            "email": $scope.search_form.email,
            "TransactionId":$scope.search_form.transID,
            "ReferenceNumber":$scope.search_form.refNum,
            "CcLast4":$scope.search_form.cc_digits,
            "Phone":$scope.search_form.phoneNum,
            "FromDate":formatDate,
            "ToDate":formatDate2,
            "Status":$scope.search_form.statusmenu,
            "TransactionType":$scope.search_form.transmenu,
            "MidGroupId":$scope.search_form.midmenu
    };

    console.log(formQuery);

    // SEND POST REQUEST
    
    $http({
      method:'POST',
      url:baseUrl + 'transactions',
      data:formQuery
    }).success(function(data,status) {
      // check if returned data is an object or array
          var check = angular.isArray(data);
          if(check) {
            // results returned [array]
            console.log(data);
            $scope.data = data;
            $scope.shownData = data;
            $scope.resultAmount = data.length;


            Notify.getMsg('RefundProcess', function(event,data) {
              $scope.shownData.push(data.ApiResponse);
              //console.log(data.ApiResponse);

            });

            //when UDF1 is avail hide email and show udf1 column
            for (var trans in data){
              if(trans, data[trans].Udf1){
                $scope.Udf1Show = true;
                $scope.EmailShow = false;
                break;
              } else {
                $scope.Udf1Show = false;
                $scope.EmailShow = true;
              }
            }

            // CREATE STATUS TOOLTIP
            $scope.returnStatus = function(trans) {
              if (typeof trans === 'undefined'){
                trans = {};
              }

              var result = trans.ResultCode,
                  info = trans.ResponseDescription,
                  ui;

              var check = result === 0;
              check ? ui = 'Success' : errorCheck();

              function errorCheck() {

                var regex = /declined/i;
                var tester = regex.test(info);

                if(tester) {
                  ui = 'Declined';
                } else {
                  ui = 'Failed';
                }

              }

              return ui;
              
            }

          } else {
            // no results {object}
            $scope.resultAmount = 0;
            
          } // END else


          // RESULTS FEEDBACK
          //$scope.resultAmount   = data.length;
          //$scope.searchlname    = $scope.search_form.lname;
          //$scope.searchfname    = $scope.search_form.fname;
          //$scope.searchEmail    = $scope.search_form.email;
          //$scope.searchTransID  = $scope.search_form.transID;
          
         
          $('.panel-options').slideUp(300);
          $('.snap-panel-options').slideUp(300);
          $('table thead').show(300);
          //$('form.searcher').slideUp(300);
          $('.search_feedback').slideDown(300);
          $('.container_search_parameters').show();

          // CSV EXPORT
          $scope.transactionCSV = data;

    });

  }; // END SUBMIT


  //////////////////////////
  // MODIFY SEARCH TOGGLE
  //////////////////////////
  $scope.modform = function() {
    //$('form.searcher').slideToggle(300);
    $('.panel-options').slideToggle(300);
    $('.container_search_parameters').slideToggle(300);
  }

  //////////////////////////
  // ADVANCED SEARCH TOGGLE
  //////////////////////////
  $scope.toggleSearch = function() {
  
  var txt = $('.advanced_fields').is(':visible') ? 'Advanced Search' : 'Hide Advanced Search';
             $('.advanced_search').text(txt);
             $('.advanced_fields').slideToggle();
  }

  //////////////////////////
  // SELECT MENUS
  //////////////////////////
  $scope.statusItems = [
      {value:"0", text:"Success"},
      {value:"1", text:"Declined"},
      {value:"2", text:"Error"}
  ];

  $scope.transItems = [
      {value:"1", text:"Charge"},
      {value:"2", text:"Void"},
      {value:"3", text:"Refund"},
      {value:"4", text:"Authorize"},
      {value:"6", text:"Capture"}
  ];


//-----------------------------------------//
//-----------------------------------------//

  /////////////////
  // GROUP SEARCH 
  /////////////////
  $scope.oneAtATime = false;

  // Create Dropdown Hours
  
  function createHours() {
    $scope.Hours = [];
    // loop to create 00-23 range
    for(var i=0;i<=23;i++) {
      // push numbers to Hours Array
      $scope.Hours.push(i);
    }

  }
  createHours();

  // Create Minutes in 5min Intervals
  function createMins() {
    $scope.Mins = [];
    for(var i=0;i<=55;i++) {
      if(i%5 === 0) {
        $scope.Mins.push(i);
      }
    }
  }
  createMins();
  


  /////////////
  // MOMENT JS
  /////////////

  $scope.Yesterday = $moment().subtract(1, 'days').format('L');

  //$scope.lastWeek = $moment().subtract(7, 'days').format('L');
  //$scope.lastMonth = $moment().subtract(30, 'days').format('L');
  //$scope.lastQuar = $moment().subtract(90, 'days').format('L');
  //$scope.lastYear = $moment().subtract(365, 'days').format('L');

  $scope.past3Days = $moment().subtract(3, 'days').format('L');
  $scope.past7Days = $moment().subtract(7, 'days').format('L');
  $scope.past90Days = $moment().subtract(90, 'days').format('L');
  $scope.past180Days = $moment().subtract(180, 'days').format('L');
  $scope.past360Days = $moment().subtract(365, 'days').format('L');

  /////////////////////////
  // SNAP-SHOT FORM SUBMIT
  /////////////////////////
  $scope.snapForm = {};

  $scope.snapFormSubmit = function() {

  //set todays date if dates not defined -- ALL OF THIS IN A SERVICE!
    if ($scope.snapForm.fromDate == undefined){$scope.snapForm.fromDate = new Date();}
    if ($scope.snapForm.toDate == undefined){$scope.snapForm.toDate = new Date();}

    // Convert Date Format
    var datefilter = $filter('date'),
        formatDate = datefilter($scope.snapForm.fromDate,'MM/dd/yyyy'),
        formatDate2 = datefilter($scope.snapForm.toDate, 'MM/dd/yyyy');

    // TIME SETTINGS
    $scope.fromDATE = formatDate + ' ' + $scope.fromHours + ':' + $scope.fromMins;
    $scope.toDATE = formatDate2 + ' ' + $scope.toHours + ':' + $scope.toMins;

    // CHECK FROM TIME
    if($scope.fromHours && $scope.fromMins) {
      $scope.FROMDATE = $scope.fromDATE;
    } else {
      $scope.FROMDATE = formatDate;
    }
    
    // CHECK TOTIME
    if($scope.toHours && $scope.fromMins) {
      $scope.TODATE = $scope.toDATE;
    } else {
      $scope.TODATE = formatDate2;
    }


    // QUERY OBJECT
    snapQuery = {
      "FromDate":$scope.FROMDATE,
      "GatewayId":$scope.snapForm.gateway
    };

    // "ToDate":$scope.TODATE

    console.log(snapQuery);

    // SEND POST REQUEST
    $http({
      method:'POST',
      url:baseUrl + 'transactions/snapshot',
      data:snapQuery
    }).success(function(data) {
      
      // BIND DATA TO SCOPE
      $scope.snapData = data;
      $scope.snapLen = data.length;

      // Link the Local-Data with Smart Table's Copy
      //$scope.snapData = $scope.shownSnapData; 

      
      $('.panel-options').slideUp(300);
      $('.snapForm_results').slideDown(300);
      $('.snap-panel-options').slideUp(300);

      // CSV EXPORT
      $scope.transactionCSV = data;

    });


  }; // END FORM SUBMIT





  /////////////////////
  // TRANS FORM SUBMIT
  /////////////////////

  // cache form to clear input fields
  $scope.transForm = {};

  $scope.transFormSubmit = function() {

    //set todays date if dates not defined
    if ($scope.transForm.fromDate == undefined){$scope.transForm.fromDate = new Date();}
    if ($scope.transForm.toDate == undefined){$scope.transForm.toDate = new Date();}

    // Convert Date Format
    var datefilter = $filter('date'),
        formatDate = datefilter($scope.transForm.fromDate,'MM/dd/yyyy'),
        formatDate2 = datefilter($scope.transForm.toDate, 'MM/dd/yyyy');

    // TIME SETTINGS
    $scope.fromDATE = formatDate + ' ' + $scope.fromHours + ':' + $scope.fromMins;
    $scope.toDATE = formatDate2 + ' ' + $scope.toHours + ':' + $scope.toMins;

    // CHECK FROM TIME
    if($scope.fromHours && $scope.fromMins) {
      $scope.FROMDATE = $scope.fromDATE;
    } else {
      $scope.FROMDATE = formatDate;
    }
    
    // CHECK TOTIME
    if($scope.toHours && $scope.fromMins) {
      $scope.TODATE = $scope.toDATE;
    } else {
      $scope.TODATE = formatDate2;
    }



    // QUERY OBJECT
    transQuery = {
      "FromDate":$scope.FROMDATE,
      "ToDate":$scope.TODATE,
      "TransactionType":+$scope.transForm.transType || undefined,
      "Status":+$scope.transForm.Status || undefined,
      "TransactionId":$scope.transForm.transId,
      "GatewayId":$scope.transForm.gateway,
      "MidId":$scope.transForm.MID,
      "CcLast4":$scope.transForm.CcLast4,
      "ReferenceNumber":$scope.transForm.refNumber,
      "FirstName":$scope.transForm.fname
    }

    console.log(transQuery);


    // QUERY POST REQUEST
    $http({
      method:'POST',
      url:baseUrl + 'transactions/v2',
      data:transQuery
    }).success(function(data) {

      // SETUP NESTED TRANSACTIONS
      $scope.getNestedApiUser = function(tran) {
         $scope.nestedTrans = tran.RelatedTransactions;
      }

      // CREATE STATUS TOOLTIP
      $scope.returnStatus = function(tran) {
          var trans = {},
              result = tran.ResultCode,
              info = tran.ResponseDescription,
              ui;
              
              var check = result === 0;
              check ? ui = 'Success' : errorCheck();

              function errorCheck() {

                var regex = /declined/i;
                var tester = regex.test(info);

                if(tester) {
                  ui = 'Declined';
                } else {
                  ui = 'Failed';
                }

              };
            return ui;
      }; // END RETURN STATUS

      // CREATE NESTED STATUS
      $scope.getNestedStatus = function(tran) {
         var trans = {},
             result = tran.ResultCode,
             info = tran.ResponseDescription,
             ui;

         var check = result === 0;
         check ? ui = 'Success' : errorChecker();

         function errorChecker() {
            var regex = /declined/i;
            var tester = regex.test(info);

            if(tester) {
              ui = 'Declinded';
            } else {
              ui = 'Failed';
            }

         };
         return ui;
      };

      console.log(data);
      // BIND DATA
      $scope.transData = data;
      $scope.dataLen = data.length;

      // LINK SMART-TABLE SAFE COPY
      $scope.shownData = $scope.transData;

      // CSV EXPORT
      $scope.transactionCSV = data;

      // OPEN ACCORDION BY DEFAULT

      $('.panel-options').slideUp(300);
      $('.transForm_feedback').slideDown(300);
      $('.snap-panel-options').slideUp(300);



    });
    
    

  };  // END SUBMIT
  


  ///////////////
  // NEW SEARCH
  ///////////////
  $scope.new_search = function() {
    $state.go($state.$current, null, { reload: true });     
  };

  /////////////////
  // MODIFY SEARCH
  /////////////////
  $scope.modify_search = function() {
    //$('.form_wrapper').slideToggle(300);
    $('.panel-options').slideToggle(300);
    $('.searcher').show(300);
  };

  $scope.modify_snap_search = function() {
    $('.snap-panel-options').slideToggle(300);
  };

  
  $scope.doToggle = function(item) {

    //shownData[index].open = !shownData[index].open;
    

  };
  
}); // END SEARCH CTRL

///////////////////////////////////////
// DATE PICKER CONTROLS - SINGLE SEARCH
///////////////////////////////////////
app.controller('firstdateCtrl', function ($scope) {

  $scope.today = function() {
    $scope.fromDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };

  // Disable weekend selection
  /*
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };
  */

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
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

// SECOND DATE CTRL
app.controller('secdateCtrl', function ($scope) {
  $scope.today = function() {
    $scope.toDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.toDate = null;
  };

  // Disable weekend selection
  /*
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };
  */

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.initDate = new Date('2012-15-20');
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[3];
});



///////////////////////////////////////
// DATE PICKER CONTROLS - GROUP SEARCH
///////////////////////////////////////

app.controller('snapstartDateCtrl', function($scope){

  // GET TODAY DATE
  $scope.today = function() {
    $scope.fromDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
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


app.controller('snapendDateCtrl', function($scope){

  $scope.today = function() {
    $scope.toDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };


  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
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

app.controller('transfromDateCtrl', function($scope) {

  // GET TODAY DATE
  $scope.today = function() {
    $scope.fromDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
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

app.controller('transendDateCtrl', function($scope) {
  $scope.today = function() {
    $scope.toDate = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.fromDate = null;
  };


  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
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

// TRANSACTION MODAL
app.controller('transModalCtrl', function($scope,$modal,$log) {

  $scope.open = function(trans) {
     var modalInstance = $modal.open({
        templateUrl:'transModalContent.html',
        controller:transModalInstanceCtrl,
        size:'lg',
        resolve: {
          trans:function() {
            return trans;
          }
        }
     });
  }

}); // transModalCtrl


var transModalInstanceCtrl = function($scope,$modalInstance,trans,$http) {
    $scope.trans = trans;

    $scope.cancel = function() {
       $modalInstance.close();
    }
};

// REFUND MODAL
app.controller('refundModalCtrl', function($scope,$modal,$log) {

  $scope.open = function(trans) {
     var modalInstance = $modal.open({
        templateUrl:'refundModalContent.html',
        controller:refundModalInstanceCtrl,
        size:'lg',
        resolve: {
          trans:function() {
            return trans;
          }
        }
     });
  }

}); // refundModalCtrl

var refundModalInstanceCtrl = function($scope,$modalInstance,trans,$http,$timeout,Notify,baseUrl) {
    $scope.trans = trans;

    // CANCEL REFUND
    $scope.cancelRefund = function() {
       $modalInstance.close();
    }


    // PROCESS REFUND
    $scope.processRefund = function(amount,transId) {


      var refundAmount = document.getElementById('refundAmount').value;
      $scope.refundAmount = refundAmount;

      if(refundAmount != '' && $scope.refundAmount <= parseFloat(amount)) {

      $('.MID_feedback').slideDown(300);
      $('#refundBtn').addClass('hidden');

      $scope.confirmRefund = function() {

      
      $http.post(baseUrl + 'transactions/' + transId + '/refund/' + refundAmount)
           .success(function(data,status) {
               
              //console.log(data);

              if(data.ApiResponse.ResultCode != 0) {

                  $scope.voidStatus = 'Refund Failed';

                  $('.MID_feedback').hide();
                  $('.userError').slideDown(300);
                  $('.refundFailReason').append( "<i class='fa fa-exclamation-triangle'></i> Refund failed." );
                  $timeout(function() {
                    $('.userError').slideUp(300);
                    $('.refundFailReason').empty();
                    $('#refundBtn').removeClass('hidden');
                  },2000);

                  Notify.sendMsg('RefundProcess', data);
                  
              } else {
              
              Notify.sendMsg('RefundProcess', data);
              // set status
              $scope.voidStatus = 'success';
              //$('.modal-body .action_btn').hide(); 
              //$('.refund-panel').hide();
              //$('.voidFeedback').show();
              $('.MID_feedback').slideUp(300);
              $('.userCreateSuccess').show();

              $timeout(function() {
                  $modalInstance.close();
               },1500);
              

              }

           }).error(function(data,status) {

              $('.MID_feedback').hide();
              $('.userError').slideDown(300);
              $('.refundFailReason').append( "<i class='fa fa-exclamation-triangle'></i> Refund failed." );
              $timeout(function() {
                $('.userError').slideUp(300);
                $('.refundFailReason').empty();
                $('#refundBtn').removeClass('hidden');
              },3500);


              // set status
              $scope.voidStatus = 'failed';

           });
      
      } // confirmRefund
    // refund greater than amount 
    } else if ($scope.refundAmount > amount){
        $('.userError').slideDown(300);
        $('.refundFailReason').append( "<i class='fa fa-exclamation-triangle'></i> Amount entered may not exceed than initial transaction." );
        $timeout(function() {
           $('.userError').slideUp(300);
           $('.refundFailReason').empty();
           $('#refundAmount').val('');
           $('#refundAmount' ).focus();
        },3500);
    // refund greater than amount close   
    } else {
        $('.userError').slideDown(300);
        $('.refundFailReason').append( "<i class='fa fa-exclamation-triangle'></i> Please enter a refund amount." );
        $timeout(function() {
           $('.userError').slideUp(300);
           $('.refundFailReason').empty();
           $('#refundAmount' ).focus();
        },2500);
    }

    } // processRefund
}


// VOID CONFIRMATION MODAL
app.controller('voidModalCtrl', function($scope,$modal,$log) {

  $scope.open = function(trans) {
    var modalInstance = $modal.open({
      templateUrl:'voidModalContent.html',
      controller:voidModalInstanceCtrl,
      size:'lg',
      resolve: {
        trans:function() {
           return trans;
        }
      }
    });

  } // function open

}); // end voidModalCtrl

var voidModalInstanceCtrl = function($scope,$modalInstance,trans,$http,$timeout,baseUrl) {
    $scope.trans = trans;
  console.log(trans);
  
  $scope.cancelVoid = function() {
    $modalInstance.close();
  }


  $scope.processVoid = function(transId) {
    
    $('.MID_feedback').slideDown(300);
    $('#voidBtn').addClass('hidden');

    
    $scope.confirmVoid = function() {
       
      $http.post(baseUrl + 'transactions/'+ transId + '/void')
           .success(function(data,status) {
               
               // Set Void Status
               $scope.voidStatus = 'success';

               $('.MID_feedback').slideUp(300);
               $('.userCreateSuccess').show();
               $timeout(function() {
                  $modalInstance.close();
               },1500);

        }).error(function(data,status) {
          console.log(data + ' ' + status);

            $('.MID_feedback').slideUp(300);
            $('.userError').slideDown(300);
            $('.voidFailReason').append( "<i class='fa fa-exclamation-triangle'></i> Void failed." );
            $timeout(function() {
              $('.userError').slideUp(300);
              $('.voidFailReason').empty();
              $('#voidBtn').removeClass('hidden');
            },2000);

          // Set Void Status
          $scope.voidStatus = 'failed';
         
        });
    
     }

  } // process void 
};

// TabsDemoCtrl
app.controller('TabsDemoCtrl', function($scope) {
  
});
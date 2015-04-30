/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. subscribersCtrl
   02. subscriberCreateModal
   03. subscriberRemoveModalCtrl
   04. subscriberEditModalCtrl
  
 **  *************************************** **/

app.controller('subscriptionsReportCtrl', function($scope,$http,$timeout,$filter,$state,Notify,baseUrl) {
    $scope.reportSelect = 0;

    $scope.recurringReportSubmit = function() {

      var queryStartDate = $scope.subForm.startDate || new Date(),
          queryEndDate = $scope.subForm.endDate || new Date(),
          datefilter = $filter('date'),
          startDateFormat = datefilter(queryStartDate,'MM/dd/yyyy'),
          endDateFormat = datefilter(queryEndDate, 'MM/dd/yyyy');

        if($scope.subForm.$valid) {

            var Query =  {
              "StartDate":startDateFormat,
              "EndDate":endDateFormat
            }

          if ($scope.reportSelect == 0){

              $http({
                  method:'POST',
                  url:baseUrl + 'recurring/report/queuedattempts',
                  data:Query
              }).success(function(data,status) {
                // FOR DISPLAY IN VIEW
                $scope.queuedReportBulk = data;
                $scope.queuedReportAmount = data.length;
                $scope.shownQueuedReport = $scope.queuedReportBulk;

                $('.report_results_qued').slideDown(300);
                $('.report_parameters').slideUp(300);

                $('.report_results_subscription').hide();
                $('.report_results_subscriber').hide();

              }).error(function(data,status) {
                  //FORM NOT COMPLETELY FILLED OUT
                  $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                  $('.errorMsg').slideDown(500);
                  $timeout(function() {
                      $('.errorMsg').slideUp(500);
                  },3000);
              });
           
          } else if ($scope.reportSelect == 1) {

              $http({
                  method:'POST',
                  url:baseUrl + 'recurring/subscribers/summary',
                  data:Query
              }).success(function(data,status) {
                // FOR DISPLAY IN VIEW
                $scope.subscriberReportBulk = data;
                $scope.subscriberReportAmount = data.length;
                $scope.shownsubscriberReport = $scope.subscriberReportBulk;

                $('.report_results_subscriber').slideDown(300);
                $('.report_parameters').slideUp(300);

                $('.report_results_subscription').hide();
                $('.report_results_qued').hide();

              }).error(function(data,status) {
                  //FORM NOT COMPLETELY FILLED OUT
                  $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                  $('.errorMsg').slideDown(500);
                  $timeout(function() {
                      $('.errorMsg').slideUp(500);
                  },3000);
              });
          
          } else {

              $http({
                  method:'POST',
                  url:baseUrl + 'recurring/subscriptions/summary',
                  data:Query
              }).success(function(data,status) {
                // FOR DISPLAY IN VIEW
                $scope.subscriptionReportBulk = data;
                $scope.subscriptionReportAmount = data.length;
                $scope.shownsubscriptionReport = $scope.subscriptionReportBulk;

                $('.report_results_subscription').slideDown(300);
                $('.report_parameters').slideUp(300);

                $('.report_results_subscriber').hide();
                $('.report_results_qued').hide();


              }).error(function(data,status) {
                  //FORM NOT COMPLETELY FILLED OUT
                  $scope.errorMsg = 'There is an error with the API please contact your customer support. Error Code: ' + status;
                  $('.errorMsg').slideDown(500);
                  $timeout(function() {
                      $('.errorMsg').slideUp(500);
                  },3000);
              });

          }

        }

    } // end recurringReportSubmit


    // NEW SEARCH
    $scope.new_search = function() {
      $state.go($state.$current, null, { reload: true });     
    };

    //MODIFY SEARCH
    $scope.modify_search = function(){
      $('.report_parameters').slideDown(300);      
    }


});



// DATE PICKER CONTROLS - GROUP SEARCH
app.controller('subscriptionDateStartCtrl', function($scope){

  // GET TODAY DATE
  $scope.placeholderFromDate = new Date();

  // OPEN CALENDAR MODAL
  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yyyy',
    startingDay: 1
  };

  $scope.format = 'shortDate';

});

app.controller('subscriptionDateEndCtrl', function($scope){

  // GET TODAY DATE
  $scope.placeholderToDate = new Date();

  // OPEN CALENDAR MODAL
  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yyyy',
    startingDay: 1
  };

  $scope.format = 'shortDate';

});


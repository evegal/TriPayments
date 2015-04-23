/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. subscribersCtrl
   02. subscriberCreateModal
   03. subscriberRemoveModalCtrl
   04. subscriberEditModalCtrl
  
 **  *************************************** **/

app.controller('subscriptionsReportCtrl', function($scope,$http,$timeout,$filter,Notify,baseUrl) {




    $scope.subscriptionReportSubmit = function() {

      var empty = undefined,
          queryStartDate = $scope.subForm.startDate || new Date(),
          queryEndDate = $scope.subForm.endDate || new Date(),
          datefilter = $filter('date'),
          startDateFormat = datefilter(queryStartDate,'MM/dd/yyyy'),
          endDateFormat = datefilter(queryEndDate, 'MM/dd/yyyy');

        if($scope.subForm.$valid) {

            var Query =  {
              "StartDate":startDateFormat,
              "EndDate":endDateFormat
            }

            $http({
                method:'POST',
                url:baseUrl + 'recurring/report/queuedattempts',
                data:Query
            }).success(function(data,status) {
                // FOR DISPLAY IN COMMUNCATION DETAILS


            }).error(function(data,status) {
                // FOR DISPLAY IN COMMUNCATION DETAILS


            });

           
        } else {
            
          //FORM NOT COMPLETELY FILLED OUT
          $scope.errorMsg = 'Please ensure to fill in all required fields';
          $('.errorMsg').slideDown(500);
          $timeout(function() {
              $('.errorMsg').slideUp(500);
          },3000);

        }
    } // end submit


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


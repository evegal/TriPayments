/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. subscribersCtrl
   02. subscriberCreateModal
   03. subscriberRemoveModalCtrl
   04. subscriberEditModalCtrl
  
 **  *************************************** **/

app.controller('subscriptionsReportCtrl', function($scope,$http,Notify,baseUrl) {

// recurring/report/queuedplans
  $http.get(baseUrl + 'recurring/report/queuedplans').success(function(data) {
    $scope.upcomingSubscriptionsAmount = data.length;
    $scope.upcomingSubscriptionsBulk = data;

    // CSV Export
    $scope.upcomingSubscriptionsCSV = data;
  });

    $scope.shownUpcomingSubscriptions = $scope.upcomingSubscriptionsBulk;
});



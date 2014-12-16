app.controller('mockCtrl', function($scope,$http,baseUrl,$state,$rootScope) {
	

	// LOAD DATA
	$http.get('http://blooming-headland-9730.herokuapp.com/api/workers').success(function(data) {
		// BIND TO LOCAL COLLECTION
		$scope.workers = data;

		// SET SELECTED OPTION
		$scope.selectedItem = $scope.workers[2];

	});

	$rootScope.BalancingTypes = [
		   {BalancingTypeId:0, BalancingType:"None"},
		   {BalancingTypeId:1, BalancingType:"Cap"},
		   {BalancingTypeId:2, BalancingType:"Priority"}
	];

	// EDIT ACTION
	$scope.doEdit = function(worker) {
		
		//$scope.selectedItem = worker
		console.log(worker);
		// TRANSITION STATE TO EDIT MODE
		$state.go('app.single');
		// BIND SELECTED WORKER TO SINGLE SCOPE
		$rootScope.chosenWorker = worker;



	};

	

});




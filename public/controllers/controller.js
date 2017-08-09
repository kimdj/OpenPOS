function AppCtrl($scope, $http) {
	console.log("Hello world from controller.js");

	var refresh = function () {
		$http.get('/contactlist').success(function (response) {
			console.log("I got the data I requested");
			$scope.contactlist = response;
			$scope.contact = "";
		});
	};

	refresh();

	$scope.addContact = function () {
		console.log($scope.contact);
		$http.post('/contactlist', $scope.contact).success(function (response) {
			console.log(response);
			refresh();
		});
	};
}

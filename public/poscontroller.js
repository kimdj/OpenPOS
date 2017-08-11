var app = angular.module('OpenPOS', []);

// change Angular's {{foo}} -> {[{bar}]} to avoid clashing with Handlebars syntax
app.config(function ($interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});

// main controller
app.controller('PosController', function ($scope, $http) {
	console.log("Hello world from PosController/poscontroller.js");

	$scope.drinks = [];
	$scope.foods = [];
	$scope.order = [];
	$scope.new = {};
	$scope.totOrders = 0;

	$scope.getDate = function () {
		var today = new Date();
		var mm = today.getMonth() + 1;
		var dd = today.getDate();
		var yyyy = today.getFullYear();

		var date = dd + "/" + mm + "/" + yyyy

		return date
	};

	$scope.addToOrder = function (item, qty) {
		var flag = 0;
		if ($scope.order.length > 0) {
			for (var i = 0; i < $scope.order.length; i++) {
				if (item.id === $scope.order[i].id) {
					item.qty += qty;
					flag = 1;
					break;
				}
			}
			if (flag === 0) {
				item.qty = 1;
			}
			if (item.qty < 2) {
				$scope.order.push(item);
			}
		} else {
			item.qty = qty;
			$scope.order.push(item);
		}
	};

	$scope.removeOneEntity = function (item) {
		for (var i = 0; i < $scope.order.length; i++) {
			if (item.id === $scope.order[i].id) {
				item.qty -= 1;
				if (item.qty === 0) {
					$scope.order.splice(i, 1);
				}
			}
		}
	};

	$scope.removeItem = function (item) {
		for (var i = 0; i < $scope.order.length; i++) {
			if (item.id === $scope.order[i].id) {
				$scope.order.splice(i, 1);
			}
		}
	};

	$scope.getTotal = function () {
		var tot = 0;
		for (var i = 0; i < $scope.order.length; i++) {
			tot += ($scope.order[i].price * $scope.order[i].qty)
		}
		return tot;
	};

	$scope.clearOrder = function () {
		$scope.order = [];
	};

	$scope.checkout = function (index) {
		alert($scope.getDate() + " - Order Number: " + ($scope.totOrders + 1) + "\n\nOrder amount: $" + $scope.getTotal().toFixed(2) + "\n\nPayment received. Thanks.");
		$scope.order = [];
		$scope.totOrders += 1;
	};

	var refresh = function () {
		$http.get('/productlist').success(function (response) {
			$scope.productlist = response;
			$scope.product = "";
			console.log("RESPONSE: " + response);

			angular.forEach(response, function (item, key) {
				console.log("pushing --> " + item.name);
				$scope.drinks.push({
					id: item._id,
					name: item.name,
					price: item.price
				});
			});
		});
	};

	$scope.addNewItem = function (item) {
		if (item.category === "Drinks") {
			item.id = $scope.drinks.length + $scope.foods.length
			//$scope.drinks.push(item)
			$scope.new = []
			$('#myTab a[href="#drink"]').tab('show')
		} else if (item.category === "Foods") {
			item.id = $scope.drinks.length + $scope.foods.length
			//$scope.foods.push(item)
			$scope.new = []
			$('#myTab a[href="#food"]').tab('show')
		}
	};
});


function AppCtrl($scope, $http) {
	console.log("Hello world from AppCtrl/poscontroller.js");

	var refresh = function () {
		// clear all the buttons from the Menu Panel
		$scope.drinks.length = 0; // fastest way to clear an array in JavaScript

		$http.get('/productlist').success(function (response) {
			$scope.productlist = response;
			$scope.product = "";
			console.log("RESPONSE: " + response);

			angular.forEach(response, function (item, key) {
				console.log("adding menu item --> " + item.name);
				$scope.drinks.push({
					id: item._id,
					name: item.name,
					price: item.price
				});
			});
		});
	};

	refresh();

	$scope.addProduct = function () {
		$scope.product.user = $scope.uname;
		console.log($scope.product);
		$http.post('/productlist', $scope.product).success(function (response) {
			console.log("addProduct: " + $scope.product);
			refresh(); // refresh the Menu Panel
		});
	};

	$scope.remove = function (id) {
		console.log(id);
		$http.delete('/productlist/' + id).success(function (response) {
			console.log("remove: " + response);
			refresh(); // refresh the Menu Panel
		});
	};
}

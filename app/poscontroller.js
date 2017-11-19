// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.

var app = angular.module('OpenPOS', []);

// modify how Angular interpolates {{foo}} -> {[{bar}]} to avoid clashing with Handlebars syntax
app.config(function ($interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});

// main controller
app.controller('PosController', function ($scope, $http) {

	$scope.drinks = [];
	$scope.foods = [];
	$scope.other = [];

	$scope.categories = [
		{
			'category': 'Foods'
		},
		{
			'category': 'Drinks'
		},
		{
			'category': 'Other'
		}
    ]
	
	$scope.selectedCategory = '';
	$scope.order = [];
	$scope.new = {};
	$scope.totOrders = 0;

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

	$scope.getDate = function () {
		var today = new Date();
		var mm = today.getMonth() + 1;
		var dd = today.getDate();
		var yyyy = today.getFullYear();

		var date = dd + "/" + mm + "/" + yyyy

		return date
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

			angular.forEach(response, function (item, key) {
				if (item.category === "Foods") {
					$scope.foods.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				} else if (item.category === "Drinks") {
					$scope.drinks.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				} else {
					$scope.other.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				}
			});
		});
	};
});


function AppCtrl($scope, $http) {
	
	var refresh = function () {
		console.log("Refreshing menu");

		$http.get('/productlist').success(function (response) {
			
			// clear all the buttons from the Menu Panel
			$scope.foods.length = 0;
			$scope.drinks.length = 0;
			$scope.other.length = 0;

			$scope.productlist = response;
			$scope.product = "";

			angular.forEach(response, function (item, key) {

				if (item.category === "Foods") {
					$scope.foods.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				} else if (item.category === "Drinks") {
					$scope.drinks.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				} else {
					$scope.other.push({
						id: item._id,
						name: item.name,
						price: item.price
					});
				}
			});
		});
	};

	// do an initial refresh after the user logs in
	refresh();

	$scope.addProduct = function () {
		var nameStr = $scope.product.name;
		var priceStr = $scope.product.price;
		var priceRegex = /^((\d{0,3}(,\d{3})+)|\d+)(\.\d{2})?$/; // allow valid currency values only

		if (nameStr.length > 36) {
			alert("Item name can be a maximum of 36 characters long.");
		} else if (!priceRegex.test(priceStr)) {
			alert("Please enter a valid price.");
		} else {
			$scope.product.category = $scope.selectedCategory;
			$scope.product.user = $scope.uname;
			console.log($scope.product);
			$http.post('/productlist', $scope.product).success(function (response) {
				console.log('addProduct successful!');
				refresh(); // refresh the Menu Panel
			});
		}
	};

	$scope.remove = function (id) {
		console.log(id);
		$http.delete('/productlist/' + id).success(function (response) {
			console.log('remove successful!');
			refresh(); // refresh the Menu Panel
		});
	};
}

function TimeCtrl($scope, $timeout) {
	$scope.clock = "loading clock...";
	$scope.tickInterval = 1000  // ms

	var tick = function () {
		$scope.clock = Date.now()  // get the current time
		$timeout(tick, $scope.tickInterval);  // reset the timer
	}

	// start the timer
	$timeout(tick, $scope.tickInterval);
}

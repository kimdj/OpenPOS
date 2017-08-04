// Code goes here
var app = angular.module('OpenPOS', []);

app.controller('PosController', function ($scope) {

	$scope.drinks = [{
			id: 0,
			name: "Fountain",
			price: "2.00",
    },
		{
			id: 1,
			name: "Cans",
			price: "1.25",
    },
		{
			id: 2,
			name: "Bottles",
			price: "2.25",
    },
		{
			id: 3,
			name: "Water",
			price: "2.00",
    },
		{
			id: 4,
			name: "Hot Tea",
			price: "1.75",
    }];

	$scope.foods = [{
			id: 5,
			name: "Chicken",
			price: "9.75",
    },
		{
			id: 6,
			name: "Pork",
			price: "10.50",
    },
		{
			id: 7,
			name: "Beef",
			price: "11.50",
    },
		{
			id: 8,
			name: "Chicken & Pork",
			price: "11.25",
    },
		{
			id: 9,
			name: "Chicken & Beef",
			price: "11.50",
    },
		{
			id: 10,
			name: "Pork & Beef",
			price: "11.50",
    },
		{
			id: 11,
			name: "Chicken Salad",
			price: "9.00",
    },
		{
			id: 12,
			name: "Tofu Bowl",
			price: "9.50",
    },
		{
			id: 13,
			name: "Yakisoba",
			price: "9.00",
    },
		{
			id: 14,
			name: "Yakisoba w/ Meat",
			price: "10.75",
    }];

	$scope.order = [];
	$scope.new = {};
	$scope.totOrders = 0;

	var url = window.location.protocol + "://" + window.location.host + "/" + window.location.pathname;

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

	$scope.addNewItem = function (item) {
		if (item.category === "Drinks") {
			item.id = $scope.drinks.length + $scope.foods.length
			$scope.drinks.push(item)
			$scope.new = []
			$('#myTab a[href="#drink"]').tab('show')
		} else if (item.category === "Foods") {
			item.id = $scope.drinks.length + $scope.foods.length
			$scope.foods.push(item)
			$scope.new = []
			$('#myTab a[href="#food"]').tab('show')
		}
	};

});

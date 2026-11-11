// Testes unitários da regra de desconto (services/pricing.js).
// Rodar: npm test   (usa o test runner nativo do Node, sem dependências)

var test = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../services/pricing');

test('compra abaixo de R$ 200 não tem desconto', function () {
	var t = pricing.calculateTotals([{ price: 50, qty: 3 }]);
	assert.deepEqual(t, { subtotal: 150, discountRate: 0, discount: 0, total: 150 });
});

test('compra de exatamente R$ 200,00 NÃO tem desconto (regra é "superior a")', function () {
	var t = pricing.calculateTotals([{ price: 100, qty: 2 }]);
	assert.equal(t.discount, 0);
	assert.equal(t.total, 200);
});

test('compra de R$ 200,01 já ganha 5% de desconto', function () {
	var t = pricing.calculateTotals([{ price: 200.01, qty: 1 }]);
	assert.equal(t.discountRate, 0.05);
	assert.equal(t.discount, 10);      // 5% de 200,01 = 10,0005 -> R$ 10,00
	assert.equal(t.total, 190.01);
});

test('compra de R$ 300 paga R$ 285', function () {
	var t = pricing.calculateTotals([{ price: 75, qty: 4 }]);
	assert.deepEqual(t, { subtotal: 300, discountRate: 0.05, discount: 15, total: 285 });
});

test('soma em centavos não sofre erro de ponto flutuante', function () {
	// 0.1 + 0.2 em float = 0.30000000000000004
	var t = pricing.calculateTotals([{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }]);
	assert.equal(t.total, 0.3);
});

test('vários itens somados ultrapassando o limite', function () {
	var t = pricing.calculateTotals([
		{ price: 19.9, qty: 5 },   // 99,50
		{ price: 8.75, qty: 12 }   // 105,00
	]);
	assert.equal(t.subtotal, 204.5);
	assert.equal(t.discount, 10.23); // 10,225 arredondado
	assert.equal(t.total, 194.27);
});

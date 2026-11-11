// Testes da busca de produtos com caracteres especiais (services/text.js).
// Rodar: npm test

var test = require('node:test');
var assert = require('node:assert/strict');
var escapeRegex = require('../services/text').escapeRegex;

test('escapa todos os caracteres especiais de regex', function () {
	assert.equal(escapeRegex('.*+?^${}()|[]\\'), '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
});

test('texto comum continua igual', function () {
	assert.equal(escapeRegex('Arroz 5kg'), 'Arroz 5kg');
});

test('busca com parêntese não quebra e encontra o produto literal', function () {
	var re = new RegExp(escapeRegex('Refri (2L'), 'i');
	assert.ok(re.test('REFRI (2L) gelado'));
	assert.ok(!re.test('Refri 2L'));
});

test('padrão malicioso vira texto literal (sem ReDoS)', function () {
	var re = new RegExp(escapeRegex('(a+)+$'), 'i');
	var start = Date.now();
	assert.ok(!re.test('a'.repeat(40) + '!'));
	assert.ok(Date.now() - start < 50);
	assert.ok(re.test('produto (a+)+$'));
});

test('aceita valor que não é string sem lançar erro', function () {
	assert.equal(escapeRegex(123), '123');
});

// Teste de integração: sobe a API e exercita o fluxo completo via HTTP —
// cadastro de lojista, CRUD de produto com estoque, compra no Caixa e na
// Loja do Cliente, baixa de estoque e desconto de 5%.
//
// Por padrão sobe um MongoDB EM MEMÓRIA (mongodb-memory-server), então roda
// em qualquer máquina sem banco instalado e nunca toca o banco da turma.
// Para usar um MongoDB já existente (ex.: o serviço do GitHub Actions):
//   MONGO_URI_TEST=mongodb://127.0.0.1:27017/OpenPOS_test npm test

var test = require('node:test');
var assert = require('node:assert/strict');

test('fluxo completo de compra', { timeout: 300000 }, async function (t) {
	var memoryServer = null;
	var uri = process.env.MONGO_URI_TEST;
	if (!uri) {
		// Na primeira execução baixa o binário do MongoDB (pode levar 1-2 min).
		var { MongoMemoryServer } = require('mongodb-memory-server');
		memoryServer = await MongoMemoryServer.create();
		uri = memoryServer.getUri('OpenPOS_test');
	}
	process.env.MONGO_URI = uri;
	var mongoose = require('mongoose');
	var app = require('../server');
	await mongoose.connection.asPromise();
	await mongoose.connection.db.dropDatabase();

	var server = app.listen(0);
	var base = 'http://127.0.0.1:' + server.address().port + '/api';
	var cookie = '';

	async function call(method, path, body) {
		var res = await fetch(base + path, {
			method: method,
			headers: { 'Content-Type': 'application/json', Cookie: cookie },
			body: body ? JSON.stringify(body) : undefined
		});
		var setCookie = res.headers.get('set-cookie');
		if (setCookie) cookie = setCookie.split(';')[0];
		var text = await res.text();
		return { status: res.status, body: text ? JSON.parse(text) : null };
	}

	t.after(async function () {
		server.close();
		await mongoose.disconnect();
		if (memoryServer) await memoryServer.stop();
	});

	// --- lojista ---
	var r = await call('POST', '/auth/register', { name: 'Mercado Teste', email: 'm@t.com', username: 'mercado', password: '123456', password2: '123456' });
	assert.equal(r.status, 201);
	r = await call('POST', '/auth/login', { username: 'mercado', password: '123456' });
	assert.equal(r.status, 200);

	// --- CRUD com estoque ---
	r = await call('POST', '/products', { name: 'Arroz 5kg', price: 30, category: 'Foods', stock: 10 });
	assert.equal(r.status, 201);
	var arroz = r.body;
	assert.equal(arroz.stock, 10);

	r = await call('POST', '/products', { name: 'Refri 2L', price: 9.5, category: 'Drinks', stock: -1 });
	assert.equal(r.status, 400, 'estoque negativo deve ser rejeitado');

	r = await call('POST', '/products', { name: 'Refri 2L', price: 9.5, category: 'Drinks', stock: 3 });
	var refri = r.body;

	r = await call('PUT', '/products/' + refri._id, { name: 'Refri 2L', price: 9.5, category: 'Drinks', stock: 5 });
	assert.equal(r.body.stock, 5);

	// --- Caixa: compra abaixo de R$ 200 (sem desconto) ---
	r = await call('POST', '/sales', { items: [{ productId: arroz._id, qty: 2 }, { productId: refri._id, qty: 1 }] });
	assert.equal(r.status, 201);
	assert.equal(r.body.subtotal, 69.5);
	assert.equal(r.body.discount, 0);
	assert.equal(r.body.total, 69.5);
	assert.equal(r.body.channel, 'pdv');
	assert.equal(r.body.orderNumber, 1);

	// --- preço enviado pelo cliente é ignorado ---
	r = await call('POST', '/sales', { items: [{ productId: refri._id, qty: 1, price: 0.01 }] });
	assert.equal(r.body.total, 9.5);

	// --- estoque baixou automaticamente ---
	r = await call('GET', '/products');
	var byName = Object.fromEntries(r.body.map(function (p) { return [p.name, p]; }));
	assert.equal(byName['Arroz 5kg'].stock, 8);
	assert.equal(byName['Refri 2L'].stock, 3);

	// --- Loja do cliente (sem login): compra acima de R$ 200 ganha 5% ---
	var savedCookie = cookie; cookie = '';
	r = await call('GET', '/public/lojas/mercado/produtos');
	assert.equal(r.status, 200);
	assert.equal(r.body.products.length, 2);
	assert.equal(r.body.products[0].user, undefined, 'não expõe dados internos');

	r = await call('POST', '/public/lojas/mercado/compras', { items: [{ productId: arroz._id, qty: 7 }] }); // 210,00
	assert.equal(r.status, 201);
	assert.equal(r.body.subtotal, 210);
	assert.equal(r.body.discount, 10.5);
	assert.equal(r.body.total, 199.5);
	assert.equal(r.body.orderNumber, 3);

	// --- estoque insuficiente: 409 e NADA é baixado (rollback) ---
	r = await call('POST', '/public/lojas/mercado/compras', { items: [{ productId: refri._id, qty: 1 }, { productId: arroz._id, qty: 2 }] });
	assert.equal(r.status, 409);
	assert.match(r.body.error, /Estoque insuficiente para "Arroz 5kg"\. Disponível: 1/);
	r = await call('GET', '/public/lojas/mercado/produtos');
	byName = Object.fromEntries(r.body.products.map(function (p) { return [p.name, p]; }));
	assert.equal(byName['Refri 2L'].stock, 3, 'refri devolvido ao estoque');
	assert.equal(byName['Arroz 5kg'].stock, 1);

	// --- validações de carrinho ---
	r = await call('POST', '/public/lojas/mercado/compras', { items: [] });
	assert.equal(r.status, 400);
	r = await call('POST', '/public/lojas/mercado/compras', { items: [{ productId: arroz._id, qty: 0 }] });
	assert.equal(r.status, 400);
	r = await call('POST', '/public/lojas/naoexiste/compras', { items: [{ productId: arroz._id, qty: 1 }] });
	assert.equal(r.status, 404);

	// --- rotas internas continuam protegidas ---
	r = await call('GET', '/sales');
	assert.equal(r.status, 401);

	// --- concorrência: 5 compras simultâneas de 1 unidade com estoque 3 ---
	cookie = savedCookie;
	await call('PUT', '/products/' + refri._id, { name: 'Refri 2L', price: 9.5, category: 'Drinks', stock: 3 });
	var results = await Promise.all([1, 2, 3, 4, 5].map(function () {
		return call('POST', '/sales', { items: [{ productId: refri._id, qty: 1 }] });
	}));
	var ok = results.filter(function (x) { return x.status === 201; });
	assert.equal(ok.length, 3, 'só vende o que tem em estoque');
	var orderNumbers = new Set(ok.map(function (x) { return x.body.orderNumber; }));
	assert.equal(orderNumbers.size, 3, 'números de pedido não se repetem');
	r = await call('GET', '/products');
	assert.equal(r.body.find(function (p) { return p.name === 'Refri 2L'; }).stock, 0);

	// --- painel ---
	r = await call('GET', '/stats');
	assert.equal(r.body.totalDiscount, 10.5);
	assert.equal(r.body.discountedOrders, 1);
});

// Rotas PÚBLICAS da Loja do Cliente (sem login).
// O lojista compartilha o link /loja/<username> e qualquer cliente pode ver
// os produtos e simular uma compra. A compra passa pelo MESMO serviço de
// checkout do Caixa — então baixa de estoque e desconto são idênticos.
//
// Montado em server.js ANTES de routes/api.js, que exige sessão.

var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var User = require('../models/user');
var checkoutService = require('../services/checkout');
var pricing = require('../services/pricing');
var errors = require('../services/errors');

// Garante que a loja (lojista) existe antes de qualquer rota /lojas/:username.
router.param('username', async function (req, res, next, username) {
	try {
		var owner = await User.getUserByUsername(username);
		if (!owner) {
			return res.status(404).json({ error: 'Loja não encontrada' });
		}
		req.store = { username: owner.username, name: owner.name };
		next();
	} catch (err) {
		next(err);
	}
});

// GET /api/public/regras — parâmetros da regra de desconto, para o front
// exibir a prévia ("faltam R$ X para ganhar 5%") sem duplicar números.
router.get('/regras', function (req, res) {
	res.json({
		discountThreshold: pricing.DISCOUNT_THRESHOLD,
		discountRate: pricing.DISCOUNT_RATE
	});
});

// GET /api/public/lojas/:username/produtos — vitrine da loja.
// Expõe só o necessário (sem o campo "user", timestamps etc.).
router.get('/lojas/:username/produtos', async function (req, res) {
	try {
		var products = await Product.find({ user: req.store.username })
			.select('name price category stock')
			.sort({ name: 1 });
		res.json({ store: req.store, products: products });
	} catch (err) {
		errors.sendError(res, err, 'Falha ao carregar produtos');
	}
});

// POST /api/public/lojas/:username/compras — cliente finaliza a compra.
// Corpo: { items: [{ productId, qty }] }
router.post('/lojas/:username/compras', async function (req, res) {
	try {
		var sale = await checkoutService.checkout({
			storeUser: req.store.username,
			items: req.body.items,
			channel: 'loja'
		});

		// Recibo para o cliente: sem dados internos da loja.
		res.status(201).json({
			orderNumber: sale.orderNumber,
			items: sale.items,
			subtotal: sale.subtotal,
			discountRate: sale.discountRate,
			discount: sale.discount,
			total: sale.total,
			createdAt: sale.createdAt
		});
	} catch (err) {
		errors.sendError(res, err, 'Falha ao finalizar a compra');
	}
});

module.exports = router;

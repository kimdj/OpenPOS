// Rotas de API JSON consumidas pelo front-end React.
// Tudo aqui exige usuário autenticado (sessão do Passport) e todo dado é
// escopado ao usuário logado — cada lojista só vê/edita os próprios dados.

var express = require('express');
var router = express.Router();
var { body, validationResult } = require('express-validator');

var Product = require('../models/product');
var Sale = require('../models/sale');
var checkoutService = require('../services/checkout');
var sendError = require('../services/errors').sendError;

// -------------------- Middleware --------------------

function ensureAuthenticatedApi(req, res, next) {
	if (req.isAuthenticated && req.isAuthenticated()) {
		return next();
	}
	return res.status(401).json({ error: 'Not authenticated' });
}

router.use(ensureAuthenticatedApi);

function getUsername(req) {
	return req.user.username || req.user.user;
}

// -------------------- Products --------------------

// GET /api/products — lista os produtos do usuário logado.
// Aceita ?search=texto para filtrar por nome (case-insensitive).
router.get('/products', async function (req, res) {
	try {
		var filter = { user: getUsername(req) };

		if (req.query.search) {
			filter.name = { $regex: req.query.search, $options: 'i' };
		}

		var docs = await Product.find(filter).sort({ createdAt: -1 });
		res.json(docs);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

var productValidators = [
	body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 36 }).withMessage('Name must be 36 characters or fewer'),
	body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
	body('category').isIn(Product.CATEGORIES).withMessage('Category must be Foods, Drinks or Other'),
	body('stock').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro maior ou igual a zero').toInt()
];

// POST /api/products — cria um novo produto.
router.post('/products', productValidators, async function (req, res) {
	var errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
	}

	try {
		var product = new Product({
			name: req.body.name,
			price: req.body.price,
			category: req.body.category,
			stock: req.body.stock,
			user: getUsername(req)
		});
		var doc = await product.save();
		res.status(201).json(doc);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to save product' });
	}
});

// PUT /api/products/:id — edita um produto existente.
// Esta rota não existia no projeto original (só tinha criar e deletar).
router.put('/products/:id', productValidators, async function (req, res) {
	var errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
	}

	try {
		var doc = await Product.findOneAndUpdate(
			{ _id: req.params.id, user: getUsername(req) }, // garante que só edita o próprio produto
			{
				name: req.body.name,
				price: req.body.price,
				category: req.body.category,
				stock: req.body.stock
			},
			{ new: true, runValidators: true }
		);

		if (!doc) {
			return res.status(404).json({ error: 'Product not found' });
		}

		res.json(doc);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to update product' });
	}
});

// DELETE /api/products/:id
router.delete('/products/:id', async function (req, res) {
	try {
		var result = await Product.deleteOne({ _id: req.params.id, user: getUsername(req) });
		if (result.deletedCount === 0) {
			return res.status(404).json({ error: 'Product not found' });
		}
		res.json({ ok: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete product' });
	}
});

// -------------------- Sales (checkout / histórico) --------------------

// POST /api/sales — finaliza um pedido no Caixa (PDV).
// O corpo só precisa de { items: [{ productId, qty }] }. Preço, desconto,
// total e baixa de estoque são calculados no servidor (services/checkout.js).
router.post('/sales', async function (req, res) {
	try {
		var sale = await checkoutService.checkout({
			storeUser: getUsername(req),
			items: req.body.items,
			channel: 'pdv'
		});
		res.status(201).json(sale);
	} catch (err) {
		sendError(res, err, 'Failed to record sale');
	}
});

// GET /api/sales — histórico de vendas do usuário, mais recentes primeiro.
router.get('/sales', async function (req, res) {
	try {
		var sales = await Sale.getSalesByUser(getUsername(req));
		res.json(sales);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch sales' });
	}
});

// GET /api/stats — números agregados para o dashboard.
router.get('/stats', async function (req, res) {
	try {
		var stats = await Sale.getStats(getUsername(req));
		res.json(stats);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch stats' });
	}
});

// GET /api/me — dados do usuário logado, usado pelo front-end React para
// saber quem está autenticado sem precisar renderizar uma view Handlebars.
router.get('/me', function (req, res) {
	res.json({ username: getUsername(req), name: req.user.name });
});

module.exports = router;

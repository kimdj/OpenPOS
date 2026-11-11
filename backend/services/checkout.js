// ============================================================================
// SERVIÇO DE CHECKOUT — finaliza uma compra
// ----------------------------------------------------------------------------
// Usado tanto pelo Caixa (PDV, operador logado) quanto pela Loja do Cliente
// (página pública). Concentra TODAS as regras de uma venda num lugar só:
//
//   1. Valida o carrinho (ids válidos, quantidades inteiras >= 1).
//   2. Busca os produtos no banco — preço e nome vêm do BANCO, nunca do
//      cliente (senão bastaria mandar price: 0 pela API).
//   3. Dá BAIXA NO ESTOQUE de forma atômica: cada item é decrementado com
//        updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })
//      O filtro "stock >= qty" e o decremento acontecem numa única operação
//      no MongoDB, então duas compras simultâneas nunca deixam o estoque
//      negativo. Se algum item falhar, os itens já baixados são devolvidos
//      (compensação/rollback manual) — funciona em qualquer MongoDB, inclusive
//      local sem replica set, onde transações não estão disponíveis.
//   4. Aplica a regra de desconto (services/pricing.js).
//   5. Gera o número do pedido (contador atômico) e grava a venda.
// ============================================================================

var mongoose = require('mongoose');

var Product = require('../models/product');
var Sale = require('../models/sale');
var Counter = require('../models/counter');
var pricing = require('./pricing');
var BusinessError = require('./errors').BusinessError;

var MAX_QTY_PER_ITEM = 999;

// Junta itens repetidos e valida formato. Entrada: [{ productId, qty }].
function normalizeItems(rawItems) {
	if (!Array.isArray(rawItems) || rawItems.length === 0) {
		throw new BusinessError('O carrinho está vazio.', 400);
	}

	var byId = new Map();
	rawItems.forEach(function (item) {
		var id = item && (item.productId || item._id);
		var qty = Number(item && item.qty);

		if (!id || !mongoose.isValidObjectId(id)) {
			throw new BusinessError('Produto inválido no carrinho.', 400);
		}
		if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
			throw new BusinessError('Quantidade inválida no carrinho.', 400);
		}

		byId.set(String(id), (byId.get(String(id)) || 0) + qty);
	});

	return Array.from(byId, function (entry) {
		return { productId: entry[0], qty: entry[1] };
	});
}

// Próximo número de pedido da loja. Na primeira vez, inicializa o contador a
// partir da maior venda existente (compatível com vendas antigas).
async function nextOrderNumber(storeUser) {
	var key = 'sale:' + storeUser;
	var counter = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true });
	if (counter) return counter.seq;

	var last = await Sale.findOne({ user: storeUser }).sort({ orderNumber: -1 });
	try {
		await Counter.create({ _id: key, seq: last ? last.orderNumber : 0 });
	} catch (err) {
		if (err.code !== 11000) throw err; // 11000 = outro request criou antes; segue o jogo
	}
	return nextOrderNumber(storeUser);
}

// Devolve ao estoque os itens já baixados (usado quando algo falha no meio).
async function restock(storeUser, reserved) {
	await Promise.all(reserved.map(function (item) {
		return Product.updateOne(
			{ _id: item.productId, user: storeUser },
			{ $inc: { stock: item.qty } }
		);
	}));
}

/**
 * Finaliza uma compra.
 * @param {object} params
 * @param {string} params.storeUser  dono da loja (username do lojista)
 * @param {Array}  params.items      [{ productId, qty }]
 * @param {string} params.channel    'pdv' (caixa) ou 'loja' (cliente)
 * @returns {Promise<Sale>}
 */
async function checkout(params) {
	var storeUser = params.storeUser;
	var channel = params.channel || 'pdv';
	var items = normalizeItems(params.items);

	// 1) Carrega os produtos (somente da loja certa).
	var ids = items.map(function (i) { return i.productId; });
	var products = await Product.find({ _id: { $in: ids }, user: storeUser });
	var productsById = new Map(products.map(function (p) { return [String(p._id), p]; }));

	var missing = items.filter(function (i) { return !productsById.has(i.productId); });
	if (missing.length) {
		throw new BusinessError('Um ou mais produtos não existem mais. Atualize a página.', 404);
	}

	// 2) Baixa de estoque atômica, item a item, com rollback se algum falhar.
	var reserved = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var result = await Product.updateOne(
			{ _id: item.productId, user: storeUser, stock: { $gte: item.qty } },
			{ $inc: { stock: -item.qty } }
		);

		if (result.modifiedCount !== 1) {
			await restock(storeUser, reserved);
			var current = await Product.findById(item.productId);
			var available = current ? (current.stock || 0) : 0;
			var product = productsById.get(item.productId);
			throw new BusinessError(
				'Estoque insuficiente para "' + product.name + '". Disponível: ' + available + '.',
				409,
				{ productId: item.productId, requested: item.qty, available: available }
			);
		}
		reserved.push(item);
	}

	// 3) Monta os itens da venda com dados do banco e aplica o desconto.
	var saleItems = items.map(function (item) {
		var p = productsById.get(item.productId);
		return { productId: item.productId, name: p.name, price: p.price, category: p.category, qty: item.qty };
	});
	var totals = pricing.calculateTotals(saleItems);

	// 4) Grava a venda. Se falhar, devolve o estoque.
	try {
		var sale = new Sale({
			user: storeUser,
			items: saleItems,
			subtotal: totals.subtotal,
			discountRate: totals.discountRate,
			discount: totals.discount,
			total: totals.total,
			channel: channel,
			orderNumber: await nextOrderNumber(storeUser)
		});
		return await sale.save();
	} catch (err) {
		await restock(storeUser, reserved);
		throw err;
	}
}

module.exports = { checkout: checkout, normalizeItems: normalizeItems };

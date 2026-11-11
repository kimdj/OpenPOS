// Model de Venda (Sale) — registra cada pedido finalizado.
// Cada venda guarda uma "foto" dos itens no momento da compra (nome/preço/qty),
// então alterações futuras no cadastro de produtos não afetam vendas já feitas.
//
// A criação da venda (validação, baixa de estoque, desconto) fica em
// services/checkout.js — o model só define o formato dos dados e consultas.

var mongoose = require('mongoose');

var saleItemSchema = mongoose.Schema({
	productId: { type: String },
	name: { type: String, required: true },
	price: { type: Number, required: true },
	category: { type: String },
	qty: { type: Number, required: true, min: 1 }
}, { _id: false });

var saleSchema = mongoose.Schema({
	user: { type: String, required: true, index: true },
	items: { type: [saleItemSchema], required: true },
	subtotal: { type: Number, required: true },          // soma dos itens, sem desconto
	discountRate: { type: Number, default: 0 },           // 0 ou 0.05
	discount: { type: Number, default: 0 },               // valor do desconto em R$
	total: { type: Number, required: true },              // valor pago = subtotal - desconto
	channel: { type: String, enum: ['pdv', 'loja'], default: 'pdv' }, // caixa ou loja do cliente
	orderNumber: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now }
});

var Sale = mongoose.model('Sale', saleSchema, 'sales');

module.exports = Sale;

// Lista as vendas de um usuário, mais recentes primeiro.
module.exports.getSalesByUser = function (user, limit) {
	return Sale.find({ user: user })
		.sort({ createdAt: -1 })
		.limit(limit || 200);
};

// Agrega estatísticas simples para o dashboard: total geral, descontos
// concedidos, total por categoria e total por dia (últimos 14 dias).
module.exports.getStats = async function (user) {
	var sales = await Sale.find({ user: user }).sort({ createdAt: -1 }).limit(1000);

	var totalRevenue = 0;
	var totalDiscount = 0;
	var discountedOrders = 0;
	var totalOrders = sales.length;
	var byCategory = {};
	var byDay = {};

	sales.forEach(function (sale) {
		totalRevenue += sale.total;
		totalDiscount += sale.discount || 0;
		if (sale.discount > 0) discountedOrders += 1;

		var day = sale.createdAt.toISOString().slice(0, 10);
		byDay[day] = (byDay[day] || 0) + sale.total;

		sale.items.forEach(function (item) {
			var cat = item.category || 'Other';
			byCategory[cat] = (byCategory[cat] || 0) + (item.price * item.qty);
		});
	});

	var byDayArray = Object.keys(byDay)
		.sort()
		.slice(-14)
		.map(function (day) {
			return { date: day, total: byDay[day] };
		});

	var byCategoryArray = Object.keys(byCategory).map(function (cat) {
		return { category: cat, total: byCategory[cat] };
	});

	return {
		totalRevenue: totalRevenue,
		totalOrders: totalOrders,
		averageOrder: totalOrders ? totalRevenue / totalOrders : 0,
		totalDiscount: totalDiscount,
		discountedOrders: discountedOrders,
		byCategory: byCategoryArray,
		byDay: byDayArray
	};
};

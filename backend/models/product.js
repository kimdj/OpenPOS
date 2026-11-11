// Model de Produto.
// price é Number (permite somas/comparações e validação numérica no schema).
// stock é a quantidade disponível em estoque: inteiro, nunca negativo.
// A baixa de estoque NÃO é feita aqui, e sim em services/checkout.js, com
// update atômico condicional (stock >= qty) para nunca vender o que não há.

var mongoose = require('mongoose');

var CATEGORIES = ['Foods', 'Drinks', 'Other'];

var productSchema = mongoose.Schema({
	name: { type: String, required: true, trim: true, maxlength: 36 },
	price: { type: Number, required: true, min: 0 },
	category: { type: String, required: true, enum: CATEGORIES },
	stock: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Estoque não pode ser negativo'],
		validate: {
			validator: Number.isInteger,
			message: 'Estoque deve ser um número inteiro'
		}
	},
	user: { type: String, required: true, index: true }
}, { timestamps: true });

var Product = mongoose.model('products', productSchema, 'products');

module.exports = Product;
module.exports.CATEGORIES = CATEGORIES;

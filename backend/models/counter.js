// Contador sequencial atômico (um documento por loja).
// Usado para gerar o número do pedido (#0001, #0002...) sem condição de
// corrida: o antigo "busca a última venda e soma 1" podia gerar números
// repetidos se duas vendas fossem finalizadas ao mesmo tempo (ex.: caixa e
// loja online simultâneos).

var mongoose = require('mongoose');

var counterSchema = mongoose.Schema({
	_id: { type: String },
	seq: { type: Number, default: 0 }
}, { versionKey: false });

var Counter = mongoose.model('Counter', counterSchema, 'counters');

module.exports = Counter;

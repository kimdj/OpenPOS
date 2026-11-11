// ============================================================================
// REGRA DE NEGÓCIO — Desconto progressivo
// ----------------------------------------------------------------------------
// "Compras cujo valor seja SUPERIOR a R$ 200,00 recebem 5% de desconto."
//
// Decisões de implementação:
//  - A regra mora SÓ no back-end. O front-end apenas exibe uma prévia; o valor
//    que vale é sempre o calculado aqui, com os preços lidos do banco (o
//    cliente nunca informa preço — senão bastaria mandar price: 0 na API).
//  - "Superior a" = estritamente maior. R$ 200,00 exatos NÃO têm desconto.
//  - Todo cálculo é feito em CENTAVOS (inteiros) para evitar erros de ponto
//    flutuante (ex.: 0.1 + 0.2 !== 0.3 em JavaScript).
//  - Funções puras, sem acesso a banco: fáceis de testar (ver tests/).
// ============================================================================

var DISCOUNT_THRESHOLD = 200; // R$ — acima disso aplica desconto
var DISCOUNT_RATE = 0.05;     // 5%

function toCents(value) {
	return Math.round(Number(value) * 100);
}

function fromCents(cents) {
	return cents / 100;
}

// Recebe [{ price, qty }] e devolve o resumo financeiro da compra.
function calculateTotals(items) {
	var subtotalCents = items.reduce(function (sum, item) {
		return sum + toCents(item.price) * item.qty;
	}, 0);

	var hasDiscount = subtotalCents > toCents(DISCOUNT_THRESHOLD);
	var discountCents = hasDiscount ? Math.round(subtotalCents * DISCOUNT_RATE) : 0;

	return {
		subtotal: fromCents(subtotalCents),
		discountRate: hasDiscount ? DISCOUNT_RATE : 0,
		discount: fromCents(discountCents),
		total: fromCents(subtotalCents - discountCents)
	};
}

module.exports = {
	DISCOUNT_THRESHOLD: DISCOUNT_THRESHOLD,
	DISCOUNT_RATE: DISCOUNT_RATE,
	calculateTotals: calculateTotals
};

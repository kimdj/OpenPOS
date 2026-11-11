// Utilitários de texto usados pelas rotas.

// Escapa os caracteres especiais de expressão regular para que o texto
// digitado pelo usuário seja buscado literalmente. Sem isso, uma busca por
// "Refri (2L)" quebra a consulta, e um padrão como "(a+)+$" pode travar o
// banco (ReDoS).
function escapeRegex(text) {
	return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex: escapeRegex };

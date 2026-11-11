// Erro de regra de negócio: algo que o usuário fez de "errado" (carrinho
// vazio, estoque insuficiente, produto inexistente...). Carrega o status HTTP
// que a rota deve devolver, para separar "erro do cliente" (4xx) de
// "erro do servidor" (500) sem espalhar if/else pelas rotas.

class BusinessError extends Error {
	constructor(message, status, details) {
		super(message);
		this.name = 'BusinessError';
		this.status = status || 400;
		this.details = details;
	}
}

// Converte qualquer erro em resposta HTTP. Usado pelas rotas de venda.
function sendError(res, err, fallbackMessage) {
	if (err instanceof BusinessError) {
		return res.status(err.status).json({ error: err.message, details: err.details });
	}
	console.error(err);
	return res.status(500).json({ error: fallbackMessage || 'Erro interno' });
}

module.exports = { BusinessError: BusinessError, sendError: sendError };

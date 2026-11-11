# OpenPOS — Backend (API)

API REST em Node.js/Express + MongoDB, consumida pelo front-end React (pasta `frontend`, neste mesmo repositório).

## O que mudou para o TDE (regras de negócio)

- **Estoque** no produto (`stock`, inteiro ≥ 0) e **baixa automática** ao finalizar compra, atômica e com rollback.
- **Desconto de 5%** para compras acima de R$ 200,00, calculado no servidor (`services/pricing.js`).
- **Loja do cliente**: rotas públicas `/api/public/...` para o cliente simular compras sem login.
- Nova **camada de serviços** (`services/`): regras de negócio fora das rotas, reaproveitadas pelo caixa e pela loja.
- Venda passa a guardar `subtotal`, `discount`, `discountRate`, `total` e `channel` (`pdv` ou `loja`).
- Preço **não é mais aceito do cliente** no checkout (antes dava pra mandar `price: 0`).
- Número do pedido via contador atômico (antes podia repetir em vendas simultâneas).
- Testes automatizados com `node:test` (`npm test`).

## Histórico (versão anterior)

- Removidas as views Handlebars e o `express-handlebars` — o servidor agora é uma **API JSON pura**.
- Removidos `connect-flash`, `gulp` e `browser-sync` (não fazem mais sentido sem views server-side).
- Novo endpoint `PUT /api/products/:id` — antes só era possível criar e excluir produtos, não editar.
- Novo model e rotas de **vendas** (`/api/sales`): o checkout agora é persistido no banco (antes só mostrava um `alert()` e perdia o pedido).
- Novo endpoint `GET /api/stats` — dados agregados para o dashboard (receita total, por categoria, por dia).
- Novas rotas de autenticação em JSON (`/api/auth/login`, `/api/auth/register`, `/api/auth/logout`), para o front React consumir via `fetch` em vez de formulários HTML tradicionais.
- `price` do produto agora é `Number` no schema (antes era `String`, o que impedia somas e comparações corretas).
- Validação de produtos também no back-end (antes só existia no front, então dava pra mandar preço inválido direto pela API).

## Pré-requisitos

- Node.js 22 LTS (mínimo 20.19)
- Uma string de conexão MongoDB (Atlas ou local)

## Como rodar

```bash
npm install
cp .env.example .env
# edite o .env com sua MONGO_URI e um SESSION_SECRET próprio
npm run dev
```

O servidor sobe em `http://localhost:3000`. Você deve ver no terminal:

```
Server running on port 3000
Connected to MongoDB
```

## Estrutura (camadas)

```
server.js                 ponto de entrada, configuração do Express
routes/                   CAMADA HTTP — recebe a requisição, valida formato, chama o serviço
  auth-api.js             login, registro, logout
  api.js                  produtos (CRUD), vendas do caixa, estatísticas — exige sessão
  public-api.js           loja do cliente: vitrine e compra — SEM login
  passport-config.js      estratégia de autenticação (Passport local)
services/                 CAMADA DE REGRAS DE NEGÓCIO — não conhece HTTP
  pricing.js              regra do desconto de 5% acima de R$ 200
  checkout.js             finaliza compra: valida, baixa estoque, aplica desconto, grava venda
  errors.js               BusinessError (erro de regra -> status 4xx)
models/                   CAMADA DE DADOS — schemas Mongoose
  user.js | product.js (com stock) | sale.js (subtotal/desconto/total/canal) | counter.js
tests/
  pricing.test.js                 testes unitários da regra de desconto
  search.test.js                  busca de produtos com caracteres especiais
  checkout.integration.test.js    fluxo completo via HTTP (MongoDB em memória)
```

## Regras de negócio

| Requisito do TDE | Onde está | Como funciona |
|---|---|---|
| CRUD de produtos | `routes/api.js` | `POST/GET/PUT/DELETE /api/products`, validação com express-validator e no schema |
| Controle de estoque | `models/product.js` (`stock`) + `services/checkout.js` | Baixa **automática e atômica** na finalização: `updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. Se um item não tiver estoque, nada é baixado (rollback) e a API responde **409** dizendo qual produto faltou |
| Desconto 5% > R$ 200 | `services/pricing.js` | Calculado **só no servidor**, com preços do banco, em centavos. R$ 200,00 exatos não têm desconto ("superior a") |
| Interface do cliente | `routes/public-api.js` + página `/loja/:username` no front | Cliente compra sem login; usa o mesmo `checkout.js` do caixa |

Decisões de segurança: o front envia só `{ productId, qty }` — preço enviado pelo cliente é ignorado; estoque nunca fica negativo, mesmo com compras simultâneas; número do pedido vem de um contador atômico (sem repetição).

## Endpoints

| Método | Rota | Descrição | Login |
|---|---|---|:-:|
| POST | `/api/auth/register` | Cria uma conta de lojista | não |
| POST | `/api/auth/login` | Autentica e cria sessão | não |
| POST | `/api/auth/logout` | Encerra a sessão | sim |
| GET | `/api/me` | Dados do usuário logado | sim |
| GET | `/api/products` | Lista produtos (aceita `?search=`) | sim |
| POST | `/api/products` | Cria produto `{ name, price, category, stock }` | sim |
| PUT | `/api/products/:id` | Edita produto | sim |
| DELETE | `/api/products/:id` | Remove produto | sim |
| POST | `/api/sales` | Venda no caixa `{ items: [{ productId, qty }] }` | sim |
| GET | `/api/sales` | Histórico de vendas | sim |
| GET | `/api/stats` | Estatísticas (inclui descontos concedidos) | sim |
| GET | `/api/public/regras` | Parâmetros do desconto (limite e %) | não |
| GET | `/api/public/lojas/:username/produtos` | Vitrine da loja | não |
| POST | `/api/public/lojas/:username/compras` | Compra do cliente `{ items: [{ productId, qty }] }` | não |

Exemplo de resposta de uma venda:

```json
{ "orderNumber": 2, "subtotal": 213.84, "discountRate": 0.05, "discount": 10.69, "total": 203.15, "channel": "loja", "items": [ ... ] }
```

## Testes

```bash
npm test
```

Roda os testes unitários (desconto e busca) e o teste de integração completo. O teste de integração sobe um **MongoDB em memória** (`mongodb-memory-server`), então não precisa de banco instalado e nunca toca o banco do `.env`. Na primeira execução ele baixa o binário do MongoDB (1 a 2 minutos).

Para rodar contra um MongoDB já existente (é o que o CI faz):

```bash
MONGO_URI_TEST=mongodb://127.0.0.1:27017/OpenPOS_test npm test
```

> ⚠️ O teste de integração **apaga** o banco informado em `MONGO_URI_TEST`. Use sempre um banco próprio de teste, nunca o banco compartilhado da turma.

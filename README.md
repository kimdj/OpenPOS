# OpenPOS v2

Sistema de PDV (ponto de venda) web, open source. Esta é uma versão derivada (fork) do [OpenPOS de David Kim](https://github.com/kimdj/OpenPOS), reaproveitada e modernizada como trabalho acadêmico da disciplina de Reuso e Viabilidade de Software.

> *OpenPOS v2 is a fork of kimdj/OpenPOS: sales are now persisted, the UI was rebuilt in React, and several security issues were fixed. See "O que mudou" below.*

## O que mudou em relação ao original

| Original (2017) | v2 |
|---|---|
| Checkout só mostrava um `alert()` e o pedido se perdia | Cada venda é salva no banco, com número de pedido sequencial |
| Credenciais do MongoDB e segredo de sessão no código (S1) | Lidos de um arquivo `.env`, fora do Git |
| Qualquer usuário excluía produto de outro (S2) | Produtos escopados ao lojista logado |
| Rotas de produto sem login (S3) | API exige sessão |
| Preço salvo como texto (S4) | Preço `Number`, cálculos em centavos |
| AngularJS 1.2 + Handlebars + Gulp | React 19 + Vite (frontend) e API JSON em Express 4 + Mongoose 8 (backend) |
| Sem testes | Testes automatizados (`node:test`) e CI no GitHub Actions |

Funcionalidades novas: controle de estoque com baixa automática, desconto de 5% em compras acima de R$ 200, loja pública para o cliente, histórico de vendas e painel com gráficos.

## Estrutura

```
backend/    API REST (Node.js + Express + MongoDB)   -> ver backend/README.md
frontend/   Interface React + Vite                   -> ver frontend/README.md
docs/       Guia de instalação (COMO-RODAR.md) e material do projeto original
```

## Como rodar

Pré-requisitos: Node.js 22 LTS (mínimo 20.19) e uma string de conexão MongoDB (Atlas ou local).

```bash
# terminal 1 — backend
cd backend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
# edite o .env com a sua MONGO_URI
npm run dev

# terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173. O passo a passo detalhado está em [docs/COMO-RODAR.md](docs/COMO-RODAR.md).

## Testes

```bash
cd backend
npm test
```

Roda os testes unitários e o teste de integração do checkout num MongoDB em memória (não precisa de banco instalado).

## Créditos e licença

Projeto original: **OpenPOS**, Copyright (c) 2017 [David Kim](https://github.com/kimdj), licenciado sob a licença MIT. O aviso de copyright e a licença original estão preservados em [LICENSE.md](LICENSE.md), como a licença exige.

As alterações desta versão foram feitas por Pedro Guerreiro, Jenezio, Gabriel Alves e Pedro Augusto e são distribuídas sob a mesma licença MIT.

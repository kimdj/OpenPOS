# OpenPOS — Frontend (React)

Interface do PDV, reescrita em React + Vite, substituindo a versão anterior em AngularJS 1.2 + jQuery + Bootstrap 3 (tecnologias descontinuadas desde 2022).

## O que mudou em relação à versão anterior

- **Stack**: AngularJS 1.2 (via CDN) → React 19 + Vite, com build próprio, sem dependência de CDNs externos para funcionar.
- **Edição de produtos**: antes só dava pra criar ou excluir um item do cardápio; agora dá pra editar (nome, preço, categoria) sem precisar excluir e recriar.
- **Busca**: campo de busca por nome na tela de Produtos (não existia antes).
- **Confirmação antes de excluir**: antes o botão "Remove" excluía direto; agora abre um diálogo de confirmação.
- **Checkout persistido**: antes o botão "Checkout" só mostrava um `alert()` do navegador e o pedido era perdido; agora cada venda é salva no banco, com número de pedido sequencial.
- **Histórico de vendas**: tela nova, lista todos os pedidos já finalizados, com detalhamento por item.
- **Dashboard**: tela nova, com receita total, número de pedidos, ticket médio, gráfico de receita por dia e por categoria.
- **Validação com feedback claro**: erros de formulário aparecem junto ao campo, não em `alert()`.
- **Feedback visual**: notificações (toasts) de sucesso/erro em cada ação, estados de carregamento, recibo de venda concluída.

## Pré-requisitos

- Node.js ≥ 18
- O back-end (`openpos-backend`) rodando em `http://localhost:3000`

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. As chamadas para `/api` são automaticamente redirecionadas para o back-end na porta 3000 (configurado em `vite.config.js`), então não é preciso configurar nada de CORS manualmente.

## Estrutura

```
src/
  api/client.js           cliente HTTP central (todas as chamadas à API)
  context/
    AuthContext.jsx       estado de autenticação (login/registro/logout)
    ToastContext.jsx      notificações
  components/
    Layout.jsx             navegação lateral
    RequireAuth.jsx        protege rotas que exigem login
    ConfirmDialog.jsx      modal de confirmação (usado ao excluir)
    ProductFormModal.jsx   formulário de criar/editar produto
  pages/
    Login.jsx / SignUp.jsx  autenticação
    Register.jsx            tela do Caixa (PDV) — grid de produtos + carrinho
    Products.jsx             gerenciamento de produtos (CRUD completo)
    Sales.jsx                 histórico de vendas
    Dashboard.jsx             KPIs e gráficos
```

> Nota de nomenclatura: `Register.jsx` é a tela do **Caixa** (registradora/POS), não a tela de cadastro de usuário — essa é `SignUp.jsx`. Os nomes seguem o sentido em inglês de "cash register".

## Design

Paleta escura (ardósia) com verde-esmeralda como cor de destaque — pensada para uso prolongado em tela de loja/caixa, evitando o clichê visual de dashboards SaaS genéricos. Tipografia: Space Grotesk para títulos/números, Inter para texto, JetBrains Mono para valores monetários e códigos de pedido.

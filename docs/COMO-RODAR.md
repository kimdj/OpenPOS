# Como rodar o OpenPOS v2 (passo a passo)

Guia para quem nunca rodou o projeto. Os comandos são para o PowerShell do Windows; no Linux/macOS troque `copy` por `cp`.

## 1. Instalar

- **Node.js 22 LTS** (mínimo 20.19; baixe a versão LTS em nodejs.org). Confira com `node --version`.
- **Git** (git-scm.com). Confira com `git --version`.

## 2. Baixar o código

```powershell
git clone https://github.com/USUARIO-DO-PEDRO/OpenPOS.git
cd OpenPOS
```

## 3. Backend (API)

```powershell
cd backend
npm install
copy .env.example .env
```

Abra o `.env` e preencha:

- `MONGO_URI`: a string de conexão do MongoDB. Pode ser um banco local (`mongodb://127.0.0.1:27017/OpenPOS`) ou do MongoDB Atlas (`mongodb+srv://...`).
- `SESSION_SECRET`: qualquer texto aleatório longo.

Depois:

```powershell
npm run dev
```

Deve aparecer `Server running on port 3000` e `Connected to MongoDB`. Deixe esse terminal aberto.

## 4. Frontend (tela)

Em **outro** terminal, na pasta do projeto:

```powershell
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173, clique em **Criar conta**, faça login e cadastre alguns produtos.

## 5. Testes

```powershell
cd backend
npm test
```

Na primeira vez o teste de integração baixa um MongoDB temporário (1 a 2 minutos). Ele nunca usa o banco do `.env`.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `MongoDB connection error` | `MONGO_URI` errada, ou o IP do seu computador não está liberado no Atlas (Network Access) |
| Tela de login não entra / erro 500 | O backend não está rodando na porta 3000 |
| `npm` não é reconhecido | Node.js não instalado, ou o terminal foi aberto antes da instalação (feche e abra de novo) |
| `EADDRINUSE: 3000` | Já existe outro backend rodando; feche o terminal antigo |

> Nunca envie o arquivo `.env` para o Git nem cole a sua `MONGO_URI` em issues, PRs ou mensagens.

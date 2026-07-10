# code-connect

> [Português](#português) · [English](#english)

---

## Português

**code-connect** é uma plataforma social para compartilhar trechos de código: publique posts com
título, descrição, um bloco de código (com linguagem e tags), navegue por um feed paginado com
busca full-text, curta posts e converse em comentários aninhados (threads).

### Funcionalidades

- Cadastro e login com autenticação **JWT**
- Feed paginado com **busca full-text** (`?search=`) e filtro por tag
- Criação de posts (título, descrição, código, linguagem, thumbnail, tags) — requer login
- Curtir/descurtir posts
- Comentários com respostas aninhadas (threads)
- Leitura pública (feed, detalhe do post, comentários); escrita protegida por autenticação

### Stack

Monorepo gerenciado com [pnpm workspaces](pnpm-workspace.yaml), com dois apps:

| App | Stack |
| --- | --- |
| [`apps/web`](apps/web) | React 19, Vite, TypeScript, React Router 7, Tailwind CSS v4, Axios. Organização em Atomic Design (`atoms → molecules → organisms → templates → pages`). Testes com Vitest + Testing Library + jest-axe. Lint com Oxlint. |
| [`apps/api`](apps/api) | NestJS 11, TypeORM 11, PostgreSQL, `@nestjs/jwt` (JWT/HS256), bcryptjs, class-validator, Swagger. Testes com Jest. Lint com ESLint. |

### Estrutura do repositório

```
code-connect/
├── apps/
│   ├── web/   # frontend React + Vite
│   └── api/   # backend NestJS + PostgreSQL
├── docker-compose.yml   # PostgreSQL para desenvolvimento local
└── package.json         # scripts de orquestração do monorepo
```

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão compatível com as devDependencies de cada app)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (para rodar o PostgreSQL localmente)

### Como rodar o projeto

1. Instale as dependências do monorepo:

   ```bash
   pnpm install
   ```

2. Suba o banco PostgreSQL local (definido em [`docker-compose.yml`](docker-compose.yml)):

   ```bash
   docker compose up -d
   ```

3. Copie os arquivos de ambiente de exemplo e preencha os valores:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   **Gere um `JWT_SECRET` próprio** para `apps/api/.env` — nunca reutilize o placeholder do
   `.env.example`. Exemplo de geração:

   ```bash
   openssl rand -hex 32
   ```

4. Rode a API e o frontend (em terminais separados):

   ```bash
   pnpm dev:api   # http://localhost:3000 — docs em /docs
   pnpm dev:web   # http://localhost:5173
   ```

   As migrations do banco são aplicadas automaticamente no boot da API.

5. (Opcional) Popule o banco com dados fictícios:

   ```bash
   pnpm --filter api seed
   ```

### Variáveis de ambiente

**`apps/api/.env`** (veja [`apps/api/.env.example`](apps/api/.env.example)):

| Variável | Descrição |
| --- | --- |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL |
| `DB_USER` | Usuário do PostgreSQL |
| `DB_PASSWORD` | Senha do PostgreSQL |
| `DB_NAME` | Nome do banco de dados |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT — **obrigatório**, gere um valor único |
| `PORT` | Porta em que a API sobe (padrão `3000`) |

**`apps/web/.env`** (veja [`apps/web/.env.example`](apps/web/.env.example)):

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL base da API consumida pelo frontend |

### Comandos disponíveis

Executados a partir da raiz do monorepo (via scripts em [`package.json`](package.json)):

| Comando | Descrição |
| --- | --- |
| `pnpm dev:web` | Sobe o servidor de desenvolvimento do Vite (web) |
| `pnpm dev:api` | Sobe a API NestJS em modo watch |
| `pnpm build:web` | Build de produção do frontend |
| `pnpm build:api` | Build de produção da API |
| `pnpm build` | Build de todos os pacotes do workspace |
| `pnpm lint:web` | Lint do frontend (Oxlint) |
| `pnpm lint:api` | Lint da API (ESLint, com `--fix`) |
| `pnpm lint` | Lint de todos os pacotes |
| `pnpm test:web` | Testes do frontend (Vitest) |
| `pnpm test:api` | Testes unitários da API (Jest) |
| `pnpm test:api:e2e` | Testes end-to-end da API |
| `pnpm start:api` | Roda a API já buildada (`node dist/main`) |

### Referência da API

Com a API rodando, a documentação interativa (Swagger) fica disponível em
`http://localhost:3000/docs`.

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| `POST` | `/users` | Cria um novo usuário (cadastro) | Pública |
| `POST` | `/auth/login` | Autentica e retorna um `access_token` | Pública |
| `GET` | `/auth/me` | Retorna os dados do usuário autenticado | Requer token |
| `GET` | `/posts` | Lista posts paginados (`?search=`, filtro por tag) | Pública |
| `GET` | `/posts/:id` | Detalhe de um post | Pública |
| `GET` | `/posts/:id/comments` | Lista os comentários (em árvore) de um post | Pública |
| `POST` | `/posts` | Cria um novo post | Requer token |
| `POST` | `/posts/:id/likes` | Curte um post | Requer token |
| `DELETE` | `/posts/:id/likes` | Remove a curtida de um post | Requer token |
| `POST` | `/posts/:id/comments` | Adiciona um comentário (ou resposta) | Requer token |

### Testes

```bash
pnpm test:web        # testes do frontend
pnpm test:api         # testes unitários da API
pnpm test:api:e2e     # testes end-to-end da API
```

### Convenções do projeto

- **Atomic Design** no frontend (`atoms → molecules → organisms → templates → pages`); todo
  componente novo precisa de teste cobrindo seu uso principal.
- **Tailwind CSS** para estilização, usando os tokens de cor definidos em
  `apps/web/src/index.css` — evite valores hexadecimais soltos no código.
- **API REST** orientada a recursos (`/posts/:id`, não `/getPost`), DTOs com `class-validator`.
- **Conventional Commits** para mensagens de commit (`feat(web): ...`, `fix(api): ...`, etc.).

Detalhes completos das convenções estão em [`CLAUDE.md`](CLAUDE.md).

### Segurança

- **Nunca** commite arquivos `.env` reais — apenas os `.env.example` (com placeholders) são
  versionados. O `.gitignore` já ignora `.env` e qualquer `.env.*`, exceto os `.env.example`.
- `JWT_SECRET` é **obrigatório**: a API falha ao subir se a variável não estiver definida, para
  evitar que uma chave de assinatura padrão/conhecida seja usada em produção. Gere sempre um
  valor próprio (`openssl rand -hex 32`).

---

## English

**code-connect** is a social platform for sharing code snippets: publish posts with a title,
description, and a code block (with language and tags), browse a paginated feed with full-text
search, like posts, and discuss them through nested (threaded) comments.

### Features

- Sign-up and login with **JWT** authentication
- Paginated feed with **full-text search** (`?search=`) and tag filtering
- Post creation (title, description, code, language, thumbnail, tags) — requires authentication
- Like/unlike posts
- Comments with nested replies (threads)
- Public reads (feed, post detail, comments); writes protected by authentication

### Stack

Monorepo managed with [pnpm workspaces](pnpm-workspace.yaml), with two apps:

| App | Stack |
| --- | --- |
| [`apps/web`](apps/web) | React 19, Vite, TypeScript, React Router 7, Tailwind CSS v4, Axios. Organized with Atomic Design (`atoms → molecules → organisms → templates → pages`). Tests with Vitest + Testing Library + jest-axe. Linted with Oxlint. |
| [`apps/api`](apps/api) | NestJS 11, TypeORM 11, PostgreSQL, `@nestjs/jwt` (JWT/HS256), bcryptjs, class-validator, Swagger. Tests with Jest. Linted with ESLint. |

### Repository structure

```
code-connect/
├── apps/
│   ├── web/   # React + Vite frontend
│   └── api/   # NestJS + PostgreSQL backend
├── docker-compose.yml   # PostgreSQL for local development
└── package.json         # monorepo orchestration scripts
```

### Prerequisites

- [Node.js](https://nodejs.org/) (a version compatible with each app's devDependencies)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (to run PostgreSQL locally)

### Getting started

1. Install monorepo dependencies:

   ```bash
   pnpm install
   ```

2. Start the local PostgreSQL database (defined in [`docker-compose.yml`](docker-compose.yml)):

   ```bash
   docker compose up -d
   ```

3. Copy the example environment files and fill in the values:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   **Generate your own `JWT_SECRET`** for `apps/api/.env` — never reuse the placeholder from
   `.env.example`. Example:

   ```bash
   openssl rand -hex 32
   ```

4. Run the API and the frontend (in separate terminals):

   ```bash
   pnpm dev:api   # http://localhost:3000 — docs at /docs
   pnpm dev:web   # http://localhost:5173
   ```

   Database migrations are applied automatically on API boot.

5. (Optional) Seed the database with fake data:

   ```bash
   pnpm --filter api seed
   ```

### Environment variables

**`apps/api/.env`** (see [`apps/api/.env.example`](apps/api/.env.example)):

| Variable | Description |
| --- | --- |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign JWT tokens — **required**, generate a unique value |
| `PORT` | Port the API listens on (default `3000`) |

**`apps/web/.env`** (see [`apps/web/.env.example`](apps/web/.env.example)):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base API URL consumed by the frontend |

### Available commands

Run from the repository root (via scripts in [`package.json`](package.json)):

| Command | Description |
| --- | --- |
| `pnpm dev:web` | Start the Vite dev server (web) |
| `pnpm dev:api` | Start the NestJS API in watch mode |
| `pnpm build:web` | Production build of the frontend |
| `pnpm build:api` | Production build of the API |
| `pnpm build` | Build every workspace package |
| `pnpm lint:web` | Lint the frontend (Oxlint) |
| `pnpm lint:api` | Lint the API (ESLint, with `--fix`) |
| `pnpm lint` | Lint every workspace package |
| `pnpm test:web` | Frontend tests (Vitest) |
| `pnpm test:api` | API unit tests (Jest) |
| `pnpm test:api:e2e` | API end-to-end tests |
| `pnpm start:api` | Run the built API (`node dist/main`) |

### API reference

With the API running, interactive documentation (Swagger) is available at
`http://localhost:3000/docs`.

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/users` | Create a new user (sign-up) | Public |
| `POST` | `/auth/login` | Authenticate and return an `access_token` | Public |
| `GET` | `/auth/me` | Return the authenticated user's data | Required |
| `GET` | `/posts` | List paginated posts (`?search=`, tag filter) | Public |
| `GET` | `/posts/:id` | Post detail | Public |
| `GET` | `/posts/:id/comments` | List a post's comments (as a tree) | Public |
| `POST` | `/posts` | Create a new post | Required |
| `POST` | `/posts/:id/likes` | Like a post | Required |
| `DELETE` | `/posts/:id/likes` | Remove a like from a post | Required |
| `POST` | `/posts/:id/comments` | Add a comment (or reply) | Required |

### Tests

```bash
pnpm test:web        # frontend tests
pnpm test:api         # API unit tests
pnpm test:api:e2e     # API end-to-end tests
```

### Project conventions

- **Atomic Design** on the frontend (`atoms → molecules → organisms → templates → pages`); every
  new component needs a test covering its main usage.
- **Tailwind CSS** for styling, using the color tokens defined in `apps/web/src/index.css` — avoid
  raw hex values in the code.
- **REST API** modeled around resources (`/posts/:id`, not `/getPost`), DTOs with
  `class-validator`.
- **Conventional Commits** for commit messages (`feat(web): ...`, `fix(api): ...`, etc.).

Full convention details live in [`CLAUDE.md`](CLAUDE.md).

### Security

- **Never** commit real `.env` files — only `.env.example` files (with placeholders) are tracked.
  `.gitignore` already ignores `.env` and any `.env.*`, except `.env.example`.
- `JWT_SECRET` is **required**: the API refuses to boot if the variable isn't set, preventing a
  known/default signing key from ever being used in production. Always generate your own value
  (`openssl rand -hex 32`).

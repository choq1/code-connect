# Integração do frontend (apps/web) com o backend de autenticação (apps/api) via axios

## Context

O backend `apps/api` (NestJS) já expõe endpoints de autenticação com Swagger em `/docs`,
mas o frontend `apps/web` ainda tem os formulários de login/cadastro **stubados** — os
`handleSubmit` de `LoginPage`/`SignupPage` apenas fazem `console.log`. Não existe camada
HTTP, axios não está instalado, e o CORS não está habilitado no backend (o navegador
bloquearia as chamadas). O objetivo é ligar os formulários existentes aos endpoints reais
via **axios**, persistir o token JWT, e criar uma página **Home protegida** que consome
`GET /auth/me`.

## Endpoints do backend (referência)

Base URL: `http://localhost:3000` (sem prefixo global). Todos confirmados na exploração.

- `POST /users` (registro, público, 201) — body `{ name, email, password }` (password `MinLength(6)`) → `{ id, name, email }`. Erro `409 Email já cadastrado`.
- `POST /auth/login` (200) — body `{ email, password }` → `{ access_token }`. Erro `401 Credenciais inválidas`.
- `GET /auth/me` (protegido) — header `Authorization: Bearer <token>` → `{ id, name, email }`. Erros `401`.

Token: JWT, campo **`access_token`** (snake_case), expira em `1h`.

## Mudanças

### 1. Backend — habilitar CORS
`apps/api/src/main.ts`: adicionar antes do `app.listen`:
```ts
app.enableCors({ origin: 'http://localhost:5173', credentials: true });
```
(origem padrão do Vite; token vai por header, então `credentials` é opcional mas inofensivo.)

### 2. Instalar axios no web
`pnpm --filter web add axios`.

### 3. Config de ambiente
- Criar `apps/web/.env` com `VITE_API_URL=http://localhost:3000`.
- Criar `apps/web/.env.example` com a mesma chave (documentação).
- Ler via `import.meta.env.VITE_API_URL` (fallback `http://localhost:3000`).

### 4. Camada HTTP + serviço de auth (greenfield — não existe hoje)
Criar `apps/web/src/services/`:

- **`http.ts`** — instância axios (`axios.create({ baseURL })`) + interceptor de request
  que injeta `Authorization: Bearer <token>` a partir do token guardado.
- **`auth.ts`** — token storage (`localStorage`, chave ex. `code-connect:token`:
  `getToken`/`setToken`/`clearToken`) e funções:
  - `register({ name, email, password })` → `POST /users`
  - `login({ email, password })` → `POST /auth/login`, guarda `access_token`
  - `getMe()` → `GET /auth/me`
  - `logout()` → limpa token
  - Tipos: `AuthUser { id, name, email }`, `Credentials`, `RegisterInput`.
  - Tratamento de erro: mapear `AxiosError` (401/409) para mensagens em PT-BR reaproveitáveis nos formulários.

### 5. Wire dos formulários
Manter os organisms (`LoginForm`/`SignupForm`) **presentacionais** — só alterar os
`handleSubmit` das páginas:

- `LoginPage.tsx`: `handleSubmit` vira `async`; mapear `values.identifier` → `email`
  (o backend só faz login por email; o campo `identifier` é usado como email), chamar
  `login`, e em sucesso `navigate('/home')`. Em erro, exibir mensagem. Requer estado de
  erro/loading passado ao form (ver nota abaixo).
- `SignupPage.tsx`: `handleSubmit` async → `register` e depois `login` automático (ou
  `navigate('/login')`), seguido de `navigate('/home')`. Tratar `409`.

**Nota de UI:** os forms hoje só expõem `onSubmit`. Para mostrar erro de API e estado de
loading, estender `LoginForm`/`SignupForm` com props opcionais `submitError?: string` e
`isSubmitting?: boolean` (desabilita o Button, mostra erro via um `role="alert"` já no
padrão do `FormField`). Mudança mínima e retrocompatível.

### 6. Rota Home protegida
- Criar `apps/web/src/components/pages/HomePage/HomePage.tsx`: no mount chama `getMe()`,
  exibe `name`/`email` e um botão **Sair** (`logout()` + `navigate('/login')`). Em `401`,
  redireciona para `/login`.
- Criar `apps/web/src/components/molecules/RequireAuth/` (ou um wrapper em `App`): se não
  há token, `<Navigate to="/login" replace />`.
- `App.tsx`: adicionar `<Route path="/home" element={<RequireAuth><HomePage/></RequireAuth>} />`.

### 7. Testes (vitest + testing-library, colocalizados — convenção do repo)
Cada novo componente exige teste (regra do CLAUDE.md). Seguir o padrão de
`LoginForm.test.tsx` (render, `MemoryRouter`, `axe`, `userEvent`), mockando o serviço com
`vi.mock('../../../services/auth')`:
- `services/auth.test.ts` — login guarda token, register chama `POST /users`, getMe injeta
  header; mockar axios (`vi.mock`).
- `HomePage.test.tsx` — render com `getMe` mockado; botão sair chama `logout`.
- `RequireAuth.test.tsx` — redireciona sem token, renderiza children com token.
- Atualizar `LoginPage`/`SignupPage` (se tiverem teste) para o novo fluxo async.
- Se estender os forms com `submitError`/`isSubmitting`, cobrir essas variações.

## Arquivos-chave

- `apps/api/src/main.ts` (CORS)
- `apps/web/package.json` (axios)
- `apps/web/.env`, `apps/web/.env.example` (novos)
- `apps/web/src/services/http.ts`, `apps/web/src/services/auth.ts` (novos)
- `apps/web/src/components/pages/LoginPage/LoginPage.tsx`, `SignupPage/SignupPage.tsx`
- `apps/web/src/components/pages/HomePage/HomePage.tsx` (novo)
- `apps/web/src/components/molecules/RequireAuth/RequireAuth.tsx` (novo)
- `apps/web/src/App.tsx` (rota /home)
- `apps/web/src/components/organisms/LoginForm/LoginForm.tsx`, `SignupForm/SignupForm.tsx` (props opcionais de erro/loading)

## Verificação (end-to-end)

1. Backend: `pnpm dev:api` (porta 3000). Conferir Swagger em `http://localhost:3000/docs`.
2. Frontend: `pnpm dev:web` (Vite, 5173).
3. Fluxo no navegador: cadastrar em `/cadastro` (email novo, senha ≥6) → deve autenticar e
   ir para `/home` mostrando nome/email. Sair → volta a `/login`. Logar em `/login` → `/home`.
4. Casos de erro: senha curta/erro de credencial exibe mensagem; email duplicado no cadastro
   mostra o `409`. Acessar `/home` sem token redireciona a `/login`.
5. Testes: `pnpm test:api` (nada quebra pelo CORS) e `pnpm --filter web test`.
6. Lint: `pnpm lint:web` e `pnpm lint:api`.

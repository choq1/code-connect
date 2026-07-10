# Plano: Feed de Posts (Code Connect)

## Contexto

O app hoje só tem auth (login/cadastro) e uma `HomePage` placeholder. Vamos implementar a
funcionalidade central do produto: um **feed de publicações de código** e a **página de detalhes**
de um post, a partir dos designs do Figma (`Feed` = node `155:3099`, `Detalhes Página` = `155:3194`,
`Publicar` = `155:3123`).

Regras de negócio pedidas:
- **Não logados** podem ver o feed e os detalhes, mas **não curtem nem comentam**.
- **Logados** podem **criar posts, curtir e comentar** livremente.
- A **busca** (filtro) é **full-text search no backend**.
- Thumbnail ausente → **placeholder**.
- Feed e Detalhes compartilham layout (sidebar) → **reaproveitar via um template/layout**.
- No menu lateral, um link alterna **Login / Sair** conforme a sessão.

Decisões confirmadas com o usuário: **migrations completas** (desligar `synchronize`), implementar
**Feed + Detalhes + Publicar**, e **`/` → `/feed`** (feed é a landing pública).

---

## Backend (`apps/api`)

### 1. Infra de migrations (substitui `synchronize`)
- Criar `src/database/data-source.ts`: `DataSource` standalone (carrega env via `dotenv`), com
  `entities: [__dirname + '/../**/*.entity.{ts,js}']` e `migrations: [__dirname + '/migrations/*.{ts,js}']`.
- `src/app.module.ts`: trocar `synchronize: true` por `synchronize: false`, adicionar
  `migrations` + `migrationsRun: true` (roda migrations no boot em dev). Manter `autoLoadEntities`.
- Scripts em `apps/api/package.json` (padrão TypeORM CLI via `ts-node`):
  `typeorm`, `migration:generate`, `migration:run`, `migration:revert`, `seed`.
- Adicionar deps: `@faker-js/faker` (dev, para o seed) e `dotenv` (data-source/seed standalone).
- Migrations a criar (em `src/database/migrations/`):
  1. `CreateUsers` — tabela `users` (antes criada pelo synchronize) + colunas novas `username`
     (unique, nullable) e `avatar_url` (nullable).
  2. `CreatePosts`, `CreateComments`, `CreatePostLikes` (podem ser geradas via `migration:generate`).
  3. `AddPostSearchVector` — **escrita à mão**: coluna gerada `search_vector tsvector GENERATED
     ALWAYS AS (to_tsvector('portuguese', coalesce(title,'')||' '||coalesce(description,'')||' '||
     array_to_string(tags,' '))) STORED` + `CREATE INDEX ... USING GIN (search_vector)`.
- Nota: como o DB de dev já tem `users` do synchronize, resetar o volume antes
  (`docker compose down -v && docker compose up -d db`) ou rodar num banco limpo.

### 2. Entidades (`src/**/entities`)
Seguir o padrão de `users/entities/user.entity.ts` (`@Entity('nome')`, UUID PK, `@Column` com opções).
- `User` (editar): adicionar `@Column({ unique: true, nullable: true }) username`,
  `@Column({ nullable: true }) avatarUrl`, e relações `@OneToMany` posts/comments/likes.
- `posts/entities/post.entity.ts` — `Post`: `id`, `title`, `description` (text), `code` (text),
  `language` (nullable), `thumbnailUrl` (nullable), `tags` (`text[]` → `@Column('text', { array: true, default: [] })`),
  `author` (`@ManyToOne User`, `authorId`), `@CreateDateColumn`/`@UpdateDateColumn`, `searchVector`
  (`@Column({ type: 'tsvector', select: false, insert: false, update: false })` — mapeia a coluna gerada),
  `comments`/`likes` (`@OneToMany`).
- `posts/entities/comment.entity.ts` — `Comment`: `id`, `body`, `post` (`@ManyToOne`), `author`
  (`@ManyToOne`), `parent` (`@ManyToOne Comment`, nullable → respostas), `replies` (`@OneToMany` self),
  `@CreateDateColumn`.
- `posts/entities/post-like.entity.ts` — `PostLike`: `id`, `post`, `user`, `@CreateDateColumn`,
  `@Unique(['post', 'user'])`.

### 3. Auth: suporte a auth opcional + current user (reaproveitando o existente)
O `AuthGuard` atual lança quando não há token — não serve para rotas públicas com estado de like.
Adicionar, sem reescrever o que existe:
- `src/auth/current-user.decorator.ts` — `@CurrentUser()` que retorna `request['user']` (`JwtPayload | undefined`).
- `src/auth/optional-auth.guard.ts` — valida o token **se presente** (popula `request['user']`),
  e **sempre retorna `true`**. Usado no `GET /posts` e `GET /posts/:id`.
- Curtir/comentar/publicar continuam usando o `AuthGuard` existente.

### 4. Módulo `posts` (padrão de `users`: module + service + controller + dto/)
`@Controller('posts')`, DTOs com `class-validator` + `@ApiProperty`, respostas via mappers no service
(nunca vazar `passwordHash`). Endpoints REST:
- `GET /posts?search=&tag=&sort=recentes&page=` — **público** (`OptionalAuthGuard`). Lista paginada de
  cards: `{ id, title, description, tags, thumbnailUrl, author, likeCount, commentCount, likedByMe }`.
  Busca full-text: QueryBuilder com `WHERE search_vector @@ plainto_tsquery('portuguese', :search)`.
- `GET /posts/:id` — **público**. Post completo (inclui `code`) + árvore de comentários + contagens + `likedByMe`.
- `POST /posts` — **protegido** (`AuthGuard`). Body: `title, description, code, language?, tags[], thumbnailUrl?`.
  `authorId` = usuário atual. `201`.
- `POST /posts/:id/likes` (curtir) e `DELETE /posts/:id/likes` (descurtir) — **protegido**, idempotente,
  retorna `{ likeCount, likedByMe }`.
- `POST /posts/:id/comments` — **protegido**. Body `{ body, parentId? }`. `201`.
- `GET /posts/:id/comments` — público (refetch da árvore após comentar).

### 5. Seed (`src/database/seed.ts`)
Script standalone usando o `DataSource` + `@faker-js/faker`. Cria ~4 usuários (com `username` julio,
marcia, gabriel_luz, marcela_lins e avatar), ~12 posts (tags variadas; **alguns com `thumbnailUrl`
null** para exercitar o placeholder; `code` real), comentários com 1 nível de respostas, e curtidas.
Limpa as tabelas antes de inserir. Rodar via `pnpm --filter api seed`.

### 6. Placeholder de thumbnail (backend)
`thumbnailUrl` é nullable; o seed deixa vários nulos. A renderização do placeholder é no frontend
(ver abaixo) — o backend só entrega `null`.

### 7. Env
Adicionar `JWT_SECRET` e `PORT` ao `apps/api/.env.example` (hoje ausentes).

---

## Frontend (`apps/web`)

Seguir Atomic Design, Tailwind v4 com tokens do `@theme` (`bg`, `card`, `text`, `text-muted`,
`brand`, `danger` — **sem hex hardcoded**), fontes pela escala padrão do Tailwind, e o padrão de
serviço/axios de `services/`. Todo componente novo recebe teste colocado (Vitest + RTL + jest-axe).

### 1. Serviço `src/services/posts.ts`
Importa `{ http }` de `./http` (Bearer é anexado automaticamente). Exporta tipos (`PostCard`,
`PostDetail`, `Comment`, `Author`, `CreatePostInput`, `CreateCommentInput`) e funções:
`listPosts({search, tag, sort, page})`, `getPost(id)`, `createPost(input)`, `likePost(id)`,
`unlikePost(id)`, `createComment(id, input)`. Reaproveitar `getAuthErrorMessage` de `services/auth`.

### 2. Layout compartilhado (requisito "use layouts")
- `templates/AppShell/AppShell.tsx` — casca com `<Sidebar/>` + `<main>{children}</main>`, `bg-bg`.
  Usado por Feed, Detalhes e Publicar (é o que reaproveita a sidebar entre as telas).
- `organisms/Sidebar/Sidebar.tsx` — logo, botão **"Publicar"** (`Link` → `/publicar`), itens de nav
  (Feed, Perfil, Sobre nós) e o item **session-aware**: se `getToken()` existe → "Sair"
  (`logout()` + `navigate('/feed')`); senão → "Login" (`Link` → `/login`). Ícones como **SVG inline**
  usando `currentColor` (sem adicionar a fonte Material Icons como dependência).
- `molecules/SidebarLink/` — item ícone-sobre-rótulo (estados ativo/inativo).

### 3. Componentes de post (reutilizados entre feed e detalhes)
- `atoms/Tag/` — chip de tag. `atoms/icons/` — poucos SVGs (`code`, `share`, `chat`, `search`, `feed`,
  `account`, `info`, `logout`).
- `molecules/PostThumbnail/` — renderiza `<img>` se houver `thumbnailUrl`; caso contrário (ou em
  `onError`) mostra um **placeholder determinístico** (bloco com gradiente derivado do id/título +
  glifo `</>`), usando classes de token. **Esta é a solução de placeholder.**
- `molecules/PostStats/` — os 3 ícones com contagem (curtir `</>` / compartilhar / comentar).
  O botão de curtir fica **desabilitado/《faz login》** quando não há sessão.
- `molecules/CommentItem/` — comentário recursivo (suporta respostas / "Ver respostas").
- `molecules/SearchBar/` — reaproveita o `Input` atom + ícone; dispara a busca (FTS server-side).
- `molecules/Tab/` — aba "Recentes" (ativa/inativa).
- `organisms/PostCard/` — card do feed (thumbnail + título + descrição + tags + stats + autor);
  clique navega para `/posts/:id`.
- `organisms/CommentList/` + `organisms/CommentForm/` — lista da árvore + form (desabilitado se
  deslogado).
- `organisms/PostForm/` — form de criação (reaproveita `FormField`/`Input`/`Label`/`Button`).

### 4. Páginas
- `pages/FeedPage/` — `AppShell` + `SearchBar` + `Tab`s + grid de `PostCard`. Estado de busca chama
  `listPosts` (FTS no backend). Público. Padrão de fetch: `useEffect` com guarda `isMounted`.
- `pages/PostDetailPage/` (`/posts/:id`) — `AppShell` + card grande + bloco "Código:" + `CommentList`
  + `CommentForm`. Curtir/comentar exigem sessão. Público para leitura.
- `pages/CreatePostPage/` (`/publicar`) — `AppShell` + `PostForm`; protegida por `RequireAuth`.

### 5. Rotas (`src/App.tsx`)
- `/` → `Navigate` para `/feed`.
- `/feed` → `FeedPage` (pública), `/posts/:id` → `PostDetailPage` (pública).
- `/publicar` → `RequireAuth` > `CreatePostPage`.
- Manter `/login`, `/cadastro`, `/home`.

### 6. Gate de curtir/comentar
Componentes checam `getToken()`. Sem sessão: botão de curtir e `CommentForm` desabilitados (ou com
CTA que leva a `/login`). Com sessão: ações chamam o serviço e atualizam contagens.

---

## Arquivos-chave

- Backend: `apps/api/src/app.module.ts` (editar), `src/database/{data-source,seed}.ts` + `migrations/`,
  `src/posts/**` (novo módulo), `src/auth/{optional-auth.guard,current-user.decorator}.ts` (novos),
  `src/users/entities/user.entity.ts` (editar), `apps/api/package.json` (scripts+deps), `.env.example`.
- Frontend: `apps/web/src/services/posts.ts`, `src/components/templates/AppShell/`,
  `src/components/organisms/{Sidebar,PostCard,CommentList,CommentForm,PostForm}/`,
  `src/components/molecules/{PostThumbnail,PostStats,CommentItem,SearchBar,Tab,SidebarLink}/`,
  `src/components/pages/{FeedPage,PostDetailPage,CreatePostPage}/`, `src/App.tsx` (editar).
- Reuso: `services/http.ts`/`auth.ts`, atoms `Button`/`Input`/`Label`/`Link`, molecule `FormField`,
  `molecules/RequireAuth`, tokens de `index.css`.
- Copiar este plano para `plans/feed-posts.md` (convenção do `CLAUDE.md`) no início da execução.

## Verificação

- **DB/migrations/seed**: `docker compose down -v && docker compose up -d db`;
  `pnpm --filter api migration:run`; `pnpm --filter api seed`.
- **API**: `pnpm dev:api`, checar `/docs`; `GET /posts?search=react` (FTS), `GET /posts/:id`;
  login → `POST /posts`, `POST /posts/:id/likes` + `DELETE`, `POST /posts/:id/comments`.
  `pnpm test:api`.
- **Web**: `pnpm dev:web` → `/feed` deslogado (sem curtir/comentar; placeholder aparece nos posts sem
  thumbnail), login, curtir/comentar, `/publicar` cria post, `/posts/:id`. `pnpm --filter web test`;
  `pnpm lint`.

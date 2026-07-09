# Plano: Página de Login (Code Connect)

## Context

O app `apps/web` está no estado inicial do template Vite/React 19 — sem Tailwind, sem
biblioteca de testes, e sem componentes de domínio. Precisamos entregar a **página de
login** conforme o layout anexado, seguindo as convenções do `CLAUDE.md`:
Atomic Design, Tailwind CSS e um teste por componente.

Como esta é a primeira feature de UI, ela também precisa **instalar e configurar a base
de tooling** (Tailwind + Vitest/RTL). A página de cadastro virá depois com o **mesmo
layout base** (banner diferente + campos diferentes), então tudo é projetado para reuso:
um `AuthTemplate` recebe o banner e o conteúdo do formulário via props/children.

Decisões confirmadas com o usuário:
- Formulário **controlado com validação básica** (campos obrigatórios/formato), `onSubmit`
  ainda **não chama API** (backend não existe).
- Fundo **escuro simples** centralizando o card (sem a marca d'água decorativa).

Assets já disponíveis em `apps/web/public/`: `banner-login.png` (já inclui o logo "code
connect"), `Github.png`, `Google.png`.

## Tooling a adicionar (primeira feature de UI)

### Tailwind CSS v4
- Instalar `tailwindcss` + `@tailwindcss/vite`.
- Registrar o plugin em [apps/web/vite.config.ts](apps/web/vite.config.ts).
- Substituir o conteúdo do template em [apps/web/src/index.css](apps/web/src/index.css)
  por `@import "tailwindcss";` e um bloco `@theme` com os tokens da marca:
  - `--color-brand` (verde do botão, ~`#98E24C`), `--color-bg` (fundo escuro ~`#0A0A0B`),
    `--color-card` (~`#202024`), `--color-input` (~`#8A8A8A`/cinza), tons de texto.
- Remover `App.css` e o CSS do starter que não for reutilizado.

### Vitest + React Testing Library
- Instalar `vitest`, `@testing-library/react`, `@testing-library/user-event`,
  `@testing-library/jest-dom`, `jsdom`.
- Configurar `test` em `vite.config.ts` (`environment: 'jsdom'`, `globals: true`,
  `setupFiles`) + criar `src/test/setup.ts` importando `@testing-library/jest-dom`.
- Adicionar script `"test": "vitest"` em
  [apps/web/package.json](apps/web/package.json) e um atalho `test:web` no
  `package.json` raiz (espelhando os `*:web` existentes).

## Estrutura de componentes (Atomic Design)

Todos sob `apps/web/src/components/<nível>/`, cada um com teste colocalizado
(`Componente.tsx` + `Componente.test.tsx`).

### atoms
- `Button` — botão primário verde com ícone opcional (seta). Props: `children`,
  `type`, `disabled`, etc.
- `Input` — input estilizado; encaminha props nativas (`type`, `value`, `onChange`,
  `name`, `placeholder`).
- `Label` — rótulo de campo.
- `Checkbox` — checkbox estilizado (usado em "Lembrar-me").
- `Link` — âncora estilizada (sublinhada/acento) para "Esqueci a senha" e
  "Crie seu cadastro!".

### molecules
- `FormField` — `Label` + `Input` (recebe `label`, `name`, `type`, `value`, `onChange`,
  `error?`). Base reutilizável para todos os campos das duas páginas.
- `Checkbox` com label ("Lembrar-me") + `Link` "Esqueci a senha" alinhados numa linha
  (`RememberRow` ou composto dentro do form).
- `SocialButton` — imagem do logo (`Github.png`/`Google.png`) + rótulo abaixo.
- `Divider` — linha com texto centralizado ("ou entre com outras contas").

### organisms
- `LoginForm` — monta os `FormField` (Email/usuário, Senha), linha lembrar-me/esqueci,
  `Button` de submit; controla estado local e validação básica; expõe `onSubmit`.
- `SocialLogin` — `Divider` + grupo de `SocialButton` (Github, Google) + o bloco
  "Ainda não tem conta? / Crie seu cadastro!".

### templates
- `AuthTemplate` — **layout base reutilizável** para login e cadastro. Card centralizado
  em fundo escuro, duas colunas: `banner` (prop com `src`/`alt`) à esquerda e `children`
  (título + subtítulo + formulário + social) à direita. Responsivo: colunas empilham /
  banner some em telas estreitas.

### pages
- `LoginPage` — usa `AuthTemplate` com `banner-login.png`, renderiza título "Login",
  subtítulo "Boas-vindas! Faça seu login.", `LoginForm` e `SocialLogin`.

### Integração
- Renderizar `LoginPage` em [apps/web/src/App.tsx](apps/web/src/App.tsx) (substituindo o
  conteúdo do starter). Atualizar `<title>` em
  [apps/web/index.html](apps/web/index.html) para "Code Connect".

## Design para reuso (cadastro futuro)
- `AuthTemplate` é agnóstico ao conteúdo → cadastro reusa com outro banner e outro
  organism de formulário.
- `FormField`, `Button`, `Link`, `SocialLogin`, `Divider` são reaproveitados sem
  alteração; só um novo `SignupForm` (organism) e uma `SignupPage` (page) serão criados
  depois. **Não implementar cadastro agora.**

## Testes (um por componente, colocalizado)
- atoms/molecules: render + variações principais de props/interação (ex.: `Input`
  dispara `onChange`; `Button` respeita `disabled`; `SocialButton` mostra logo+label).
- `LoginForm`: preenche campos, valida obrigatórios, e chama `onSubmit` com os valores.
- `AuthTemplate`: renderiza banner (alt) e children.
- `LoginPage`: render do caminho principal (título, campos, botões sociais presentes).

## Verificação (end-to-end)
1. `pnpm --filter web add` das dependências e configuração acima.
2. `pnpm lint:web` — oxlint sem erros.
3. `pnpm test:web` — todos os testes passam.
4. `pnpm build:web` — `tsc -b && vite build` sem erros de tipo.
5. `pnpm dev:web` — abrir no navegador e comparar com o layout: card, banner, campos,
   lembrar-me/esqueci, botão verde, divisor, botões Github/Gmail, link de cadastro;
   validar que campos vazios acusam erro e que o submit (sem API) dispara com valores.

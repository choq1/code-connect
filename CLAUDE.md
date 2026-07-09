# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is a pnpm workspace monorepo (`pnpm-workspace.yaml`) with two apps under `apps/`:

- `apps/web` — React 19 + Vite frontend, linted with Oxlint, built with TypeScript project references (`tsconfig.app.json` / `tsconfig.node.json`).
- `apps/api` — NestJS backend (standard Nest CLI project layout: `app.module.ts` wires `AppController`/`AppService`; `main.ts` bootstraps via `NestFactory` on `process.env.PORT ?? 3000`).

Both apps are currently at their framework-generated starter state (no custom domain logic yet), so don't assume existing conventions beyond what the starters provide — check the actual source before extending a pattern.

## Commands

Run from the repository root using the workspace-level scripts in `package.json` (these shell out to `pnpm --filter <app>`):

```bash
pnpm dev:web          # start the Vite dev server for web
pnpm dev:api           # start the Nest dev server (watch mode) for api
pnpm build:web        # tsc -b && vite build for web
pnpm build:api        # nest build for api
pnpm build            # build all workspace packages (pnpm -r build)
pnpm lint:web         # oxlint for web
pnpm lint:api         # eslint --fix for api
pnpm lint             # lint all workspace packages (pnpm -r lint)
pnpm test:api         # jest unit tests for api
pnpm test:api:e2e     # jest e2e tests for api (test/jest-e2e.json config)
pnpm start:api        # run the built api (node dist/main)
```

To run a single Nest test file, use pnpm's `--filter` passthrough, e.g.:

```bash
pnpm --filter api test -- app.controller.spec.ts
pnpm --filter api test -- -t "test name pattern"
```

api Jest config (in `apps/api/package.json`) sets `rootDir: src` and matches `*.spec.ts`; e2e tests live in `apps/api/test` and use a separate config (`apps/api/test/jest-e2e.json`).

## Formatting/lint conventions

- `api`: Prettier is enforced through ESLint (`eslint-plugin-prettier/recommended`) rather than run standalone; `.prettierrc` sets `singleQuote: true`, `trailingComma: "all"`. ESLint config (`apps/api/eslint.config.mjs`) uses `typescript-eslint` recommendedTypeChecked with `no-explicit-any` off and `no-floating-promises`/`no-unsafe-argument` as warnings.
- `web`: linted with Oxlint (`apps/web/.oxlintrc.json`), not ESLint. Type-aware lint rules are not enabled by default — see `apps/web/README.md` for how to add them via `oxlint-tsgolint` if needed.

## Frontend conventions (`apps/web`)

- **Atomic Design**: components are organized by the atoms → molecules → organisms → templates → pages hierarchy. Place new components in the folder matching their level of composition (e.g. `src/components/atoms`, `src/components/molecules`, ...) rather than a flat `components/` dump. A component only belongs at a given level if it's composed exclusively of components at that level or below.
- **Tailwind CSS** is the styling approach — use utility classes over hand-written CSS/CSS modules.
- **Every component requires a test** covering its essential usage (the primary render path and its main interaction/prop variations) — not necessarily exhaustive edge-case coverage, but no component should ship untested. Colocate the test next to the component (e.g. `Button.tsx` + `Button.test.tsx`).

### Colors

- The project palette lives in `apps/web/src/index.css` as Tailwind v4 `@theme` custom properties (`--color-brand`, `--color-brand-dark`, `--color-bg`, `--color-card`, `--color-input`, `--color-text`, `--color-text-muted`, `--color-danger`), sourced from the Figma design tokens (Verde destaque, Verde petróleo, Grafite, Cinza Escuro, Cinza médio, Offwhite).
- Never hardcode a hex value in a component's `className` (no `bg-[#171d1f]` or similar). If a design calls for a color not yet in the palette, add a new `--color-*` entry to the `@theme` block in `index.css` and consume it as a semantic Tailwind class (`bg-card`, `text-danger`, etc.) — don't reach for arbitrary-value or default Tailwind palette classes (`text-red-400`, `bg-gray-800`) as a substitute.

### Font sizes

- Don't use arbitrary pixel values (`text-[15px]`) — map the design's type spec to the closest size in Tailwind's default scale (`xs`=12, `sm`=14, `base`=16, `lg`=18, `xl`=20, `2xl`=24, `3xl`=30, ...) and use that utility class instead.
- Current mapping from the Figma type scale: Label (12.5px) → `text-xs`, Paragraph Small (15px) → `text-sm`, Paragraph/Paragraph Semibold (18px) → `text-lg`, Paragraph Large (22px) → `text-xl`, Subtitle Large Semibold (31px) → `text-3xl`. Match font weight the same way (Figma "SemiBold" → `font-semibold`, not `font-bold`).

## Backend conventions (`apps/api`)

- Endpoints must be REST-compliant: model URLs around resources/nouns, not actions (`/users/:id`, not `/getUser`); use HTTP methods semantically (GET/POST/PUT/PATCH/DELETE) and correct status codes (`201` on create, `204` on empty success, `4xx` for client errors, etc.); keep requests stateless (no server-side session state between calls); nest sub-resources under their parent (`/users/:id/orders`); use plural resource names consistently.
- Prefer Nest conventions for expressing this: `@Controller('resource')` with one controller per resource, DTOs + `class-validator` for request validation, and Nest's built-in `HttpException`/status-code mechanisms rather than hand-rolled error responses.

## Git conventions

- Both apps follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages: `<type>(<optional scope>): <description>`, e.g. `feat(web): add Button atom`, `fix(api): correct users pagination`. Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`.

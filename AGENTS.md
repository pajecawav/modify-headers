# AGENTS.md

Browser extension (MV3) for modifying HTTP request/response headers via `chrome.declarativeNetRequest`. UI built with SolidJS; RPC between extension contexts via `werpc`.

## Tech stack

- **Language:** TypeScript 7 (strict mode; composite project: `tsconfig.app.json` + `tsconfig.node.json`)
- **UI:** SolidJS (TSX, `jsxImportSource: solid-js`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`); dark mode via `.dark` class on `<html>`
- **Bundler:** Rsbuild (`@rsbuild/plugin-solid`, `@rsbuild/plugin-babel`)
- **RPC:** `werpc` — a thin wrapper over tRPC v11 using `chrome.runtime.Port` as transport between extension contexts
- **Storage:** `chrome.storage.local` (key `modify-headers-state`)
- **Extension APIs:** `chrome.declarativeNetRequest` (dynamic rules), `chrome.storage`
- **Package manager:** pnpm 11.20.0, Node v24.19.0 (see `.node-version`)
- **Lint/format:** oxlint + oxfmt via `@pajecawav/tools` (CLI `pt`)
- **Git hooks:** husky (pre-commit → `pt staged`)
- **Browser testing:** `web-ext` (chromium + firefox-desktop)

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # --watch build + launch in Chromium on example.com
pnpm build            # production build to dist/
pnpm start:firefox    # launch built dist/ in Firefox
pnpm lint             # oxlint + tsc --noEmit + format check (pt format)
pnpm format           # format with writes (pt format --write)
```

**Always run `pnpm lint` before finishing a task.** If you edit code, run `pnpm format` so oxfmt formats it.

CI (`.github/workflows/ci.yml`) runs `pnpm build` + `pnpm lint` on push/PR to master.

## Architecture

The extension runs across two contexts that communicate via werpc:

```
Options page (UI)  ──werpc──▶  Background service worker  ──▶  chrome.storage.local
   (SolidJS)                        (router, store)            chrome.declarativeNetRequest
```

### Contexts

1. **Background service worker** (`src/background.ts`) — registers the werpc namespace `"background"`, owns the store, and applies DNR rules. Handler-only context (`createClient` cannot be called from the SW).
2. **Options page** (`src/options/`) — SolidJS UI, werpc client of the background. The only user-facing entry point.

### werpc

- Each context registers a router under a string namespace via `createHandler` and augments `declare module "werpc" { interface WERPCNamespaces ... }` for typing.
- Client: `createClient({ clientName })`; calls are type-safe: `client.background.<procedure>.query/mutate/subscribe`.
- Background router procedures (`src/lib/router.ts`): `list` (query), `upsertGroup` / `deleteGroup` / `toggleGroup` (mutations), `changed` (subscription — stream of store updates).
- Input validation uses hand-written type-guard functions in `.input()` (not valibot schemas).
- `persist()` = save to store + rebuild/apply DNR rules.

### Data flow

- UI edits groups/rules → debounce 400ms → `upsertGroup.mutate` → background saves to `store` → `applyDnr()` removes all old dynamic rules and adds new ones from `stateToRules()`.
- Groups can be toggled on/off (`enabled`); disabled groups are excluded from DNR.
- IDs are generated with `nanoid`.

### Domain types (`src/lib/types.ts`)

- `StoreState` → `HeaderGroup[]` → each with `rules: HeaderRule[]`.
- `HeaderRule`: header, operation (`append`/`set`/`remove`), value, headerType (`request`/`response`), condition.
- `RuleCondition` maps to `chrome.declarativeNetRequest.RuleCondition` (urlFilter/regexFilter, resourceTypes, requestMethods, initiatorDomains, domainType, etc.).

## Structure

```
src/
  background.ts        # SW entry: werpc handler + store hydration + applyDnr
  manifest.json        # MV3: SW, options_page, permissions
  global.d.ts          # declare module "*.css"
  lib/
    types.ts           # domain types
    store.ts           # Store: chrome.storage.local + cache + pub/sub (singleton store)
    dnr.ts             # StoreState → DNR rules, applyDnr/stateToRules
    router.ts          # werpc background router
    factory.ts         # createRule()/createGroup() with nanoid
    logger.ts          # createLogger(name)
    cn.ts              # cn(...) for class names
  options/
    index.tsx          # render(<App/>) into #root
    App.tsx            # group list, add/delete/change with debounce
    GroupCard.tsx      # group card: toggle, name, expand, rules
    RuleRow.tsx        # rule editor + condition
    constants.ts       # RESOURCE_TYPES / REQUEST_METHODS / DOMAIN_TYPES
    index.css          # @import tailwindcss + dark variant + base
  shared/components/   # Input, Select, Button, Checkbox, IconButton
rsbuild.config.ts      # entry: background (no html) + options; copy manifest; no hash
```

## Conventions

- **Indent with tabs.** Formatting via oxfmt (not prettier). In Zed, oxfmt is configured as the formatter for TS/TSX/JS/JSON/JSONC/Markdown.
- **No code comments** (unless requested).
- **Type imports via `import type`.** `tsconfig.node.json` uses `verbatimModuleSyntax`.
- **Components** are functions `(props: Props): JSX.Element` with `Props` declared as an `interface`. Solid specifics: `splitProps`, `createSignal`, `<Index>`/`<Show>`, `onMount`.
- **Class names** are assembled with `cn(...)` from `src/lib/cn.ts` (filters out non-strings). Base input classes are exported from `Input.tsx` and reused in `Select.tsx`.
- **werpc**: a new namespace → `createHandler` + `declare module "werpc"` augmentation in the owning context's entry point.
- **Extension types** come from `chrome-types` (listed in `tsconfig.app.json` `types`), NOT `@types/chrome`.
- **Build**: output to `dist/` without hashes or minification (for debugging), `chunkSplit: "all-in-one"`. `manifest.json` is copied as-is.

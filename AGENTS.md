# AGENTS.md

Browser extension (MV3) for modifying HTTP request/response headers via `chrome.declarativeNetRequest`. UI built with SolidJS; RPC between extension contexts via `werpc`.

## Tech stack

- **Language:** TypeScript 7 (strict mode; composite project: `tsconfig.app.json` + `tsconfig.node.json` + `tsconfig.e2e.json`)
- **UI:** SolidJS (TSX, `jsxImportSource: solid-js`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`); dark mode via `.dark` class on `<html>`
- **Bundler:** Rsbuild (`@rsbuild/plugin-solid`, `@rsbuild/plugin-babel`)
- **RPC:** `werpc` — a thin wrapper over tRPC v11 using `chrome.runtime.Port` as transport between extension contexts
- **Validation:** `zod` schemas (in `types.ts` for domain types, in `router.ts` for werpc `.input()`)
- **Storage:** `chrome.storage.local` (key `modify-headers-state`)
- **Extension APIs:** `chrome.declarativeNetRequest` (dynamic rules), `chrome.storage`, `chrome.offscreen` (dark-mode icon switching via MATCH_MEDIA), `chrome.action` (badge with active rule count)
- **Package manager:** pnpm 11.20.0, Node v24.19.0 (see `.node-version`)
- **Lint/format:** oxlint + oxfmt via `@pajecawav/tools` (CLI `pt`)
- **Git hooks:** husky (pre-commit → `pt staged`)
- **E2E testing:** Playwright (`@playwright/test`) — loads the unpacked MV3 extension in bundled Chromium
- **Manual browser testing:** `web-ext` (chromium + firefox-desktop)

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # --watch build + launch in Chromium on example.com
pnpm build            # production build to dist/
pnpm start:firefox    # launch built dist/ in Firefox
pnpm lint             # oxlint + tsc --noEmit + format check (pt format)
pnpm format           # format with writes (pt format --write)
pnpm test            # Playwright e2e (builds dist/ via globalSetup, then runs tests)
```

After `pnpm install`, run `pnpm exec playwright install chromium` once to fetch the browser.

**Always run `pnpm lint` before finishing a task.** If you edit code, run `pnpm format` so oxfmt formats it.

CI (`.github/workflows/ci.yml`) runs `pnpm build` + `pnpm lint` on push/PR to master. E2E tests are not yet wired into CI.

## Architecture

The extension runs across three contexts that communicate via werpc:

```
Options page (UI)  ──werpc──▶  Background service worker  ──▶  chrome.storage.local
   (SolidJS)                        (router, store)            chrome.declarativeNetRequest
                                                                chrome.action (badge)
Offscreen doc ──werpc──▶  Background  ──▶  chrome.action.setIcon (dark-mode icon)
```

### Contexts

1. **Background service worker** (`src/background/index.ts`) — registers the werpc namespace `"background"`, owns the store, and applies DNR rules. Handler-only context (`createClient` cannot be called from the SW).
2. **Options page** (`src/options/`) — SolidJS UI, werpc client of the background. The only user-facing entry point.
3. **Offscreen document** (`src/offscreen/index.ts`) — werpc client of the background; created on SW startup to observe `prefers-color-scheme` via MATCH_MEDIA (SW cannot access `matchMedia`). Reports theme changes to background → `chrome.action.setIcon`.

### werpc

- Each context registers a router under a string namespace via `createHandler` and augments `declare module "werpc" { interface WERPCNamespaces ... }` for typing.
- Client: `createClient({ clientName })`; calls are type-safe: `client.background.<procedure>.query/mutate/subscribe`.
- Background router procedures (`src/lib/router.ts`): `list` (query), `upsertGroup` / `deleteGroup` / `toggleGroup` / `toggleAll` (mutations), `themeChanged` (mutation), `changed` (subscription — stream of store updates).
- Input validation uses zod schemas in `.input()` (`headerGroupSchema`, `z.string()`, `z.object(...)`).
- `persist()` = save to store + rebuild/apply DNR rules + update badge.

### Data flow

- UI edits groups/rules → debounce 400ms → `upsertGroup.mutate` → background saves to `store` → `applyDnr()` removes all old dynamic rules and adds new ones from `stateToRules()`.
- Groups can be toggled on/off (`enabled`); disabled groups are excluded from DNR. The whole extension can be toggled via `toggleAll` (`StoreState.enabled`).
- `chrome.action` badge shows the count of active rules (amber) or a red dot when disabled.
- IDs are generated with `nanoid`.

### Domain types (`src/lib/types.ts`)

- `StoreState` → `HeaderGroup[]` → each with `rules: HeaderRule[]`.
- `HeaderRule`: header, operation (`append`/`set`/`remove`), value, headerType (`request`/`response`), condition.
- `RuleCondition` maps to `chrome.declarativeNetRequest.RuleCondition` (urlFilter/regexFilter, resourceTypes, requestMethods, initiatorDomains, domainType, etc.).

## Structure

```
src/
  background/
    index.ts          # SW entry: werpc handler + store hydration + applyDnr
    theme.ts          # offscreen doc creation + setIcon (dark-mode icon)
  manifest.json        # MV3: SW, options_page, permissions, action theme_icons
  global.d.ts          # declare module "*.css"
  lib/
    types.ts           # domain types + zod schemas
    store.ts           # Store: chrome.storage.local + cache + pub/sub (singleton store)
    dnr.ts             # StoreState → DNR rules, applyDnr/stateToRules
    router.ts          # werpc background router
    badge.ts           # applyBadge: active rule count or red dot when disabled
    factory.ts         # createRule()/createGroup() with nanoid
    logger.ts          # createLogger(name)
    cn.ts              # cn(...) for class names
  options/
    index.tsx          # render(<App/>) into #root
    App.tsx            # group list, add/delete/change with debounce
    GroupCard.tsx      # group card: toggle, name, expand, rules
    RuleRow.tsx        # rule editor + condition
    favicon.ts         # favicon switching + reports theme to background
    constants.ts       # RESOURCE_TYPES / REQUEST_METHODS / DOMAIN_TYPES
    index.css          # @import tailwindcss + dark variant + base
  offscreen/
    index.ts           # MATCH_MEDIA observer → background.themeChanged
  shared/components/   # Input, Select, Button, Checkbox, Switch, Radio, RadioGroup, IconButton, HttpIcon
rsbuild.config.ts      # entry: background (no html) + offscreen + options; copy manifest; no hash
playwright.config.ts   # e2e: globalSetup builds dist/, channel:'chromium', workers:1
e2e/                   # Playwright tests (see E2E testing below)
```

## Conventions

- **Indent with tabs.** Formatting via oxfmt (not prettier). In Zed, oxfmt is configured as the formatter for TS/TSX/JS/JSON/JSONC/Markdown.
- **No code comments** (unless requested).
- **Type imports via `import type`.** `tsconfig.node.json` uses `verbatimModuleSyntax`.
- **Components** are functions `(props: Props): JSX.Element` with `Props` declared as an `interface`. Solid specifics: `splitProps`, `createSignal`, `<Index>`/`<Show>`, `onMount`.
- **Class names** are assembled with `cn(...)` from `src/lib/cn.ts` (filters out non-strings). Base input classes are exported from `Input.tsx` and reused in `Select.tsx`.
- **werpc**: a new namespace → `createHandler` + `declare module "werpc"` augmentation in the owning context's entry point.
- **Extension types** come from `chrome-types` (listed in `tsconfig.app.json` and `tsconfig.e2e.json` `types`), NOT `@types/chrome`.
- **Build**: output to `dist/` without hashes or minification (for debugging), `chunkSplit: "all-in-one"`. `manifest.json` is copied as-is.

## E2E testing

Playwright loads the unpacked extension in bundled Chromium and tests the full stack: UI → werpc → store → DNR → real HTTP headers.

### Setup

- `playwright.config.ts` — `globalSetup` runs `pnpm build` to produce `dist/`, then tests execute against it. Uses `channel: 'chromium'` (Playwright's bundled Chromium, supports headless extension loading without xvfb). `workers: 1` (extension state is shared via persistent context).
- Extension is loaded via `chromium.launchPersistentContext()` with `--disable-extensions-except` + `--load-extension` pointing at `dist/`. Each test gets a fresh temp user-data dir (clean storage).
- Extension ID is dynamic — extracted at runtime from the service worker URL (`new URL(worker.url()).hostname`), never hardcoded.
- `tsconfig.e2e.json` includes `chrome-types` so `worker.evaluate(() => chrome.* ...)` is typed.

### Structure

```
e2e/
  global-setup.ts     # runs `pnpm build`, checks dist/manifest.json exists
  echo-server.ts      # local http.Server: reflects request headers as JSON, sets x-test-resp response header
  helpers.ts          # getActiveServiceWorker, getExtensionId, getDnrRules, getStorage, waitForDnrRuleCount, waitForStorage, evictServiceWorker (CDP stopAllWorkers)
  fixtures.ts         # test fixtures: context (persistent + load-extension), page, serviceWorker, extensionId, echoServer, echoUrl
  options-ui.spec.ts  # UI scenarios on options page
  dnr-request.spec.ts # real request header modification (set/remove/append)
  dnr-response.spec.ts# real response header modification (set/remove)
  persistence.spec.ts # DNR rules survive SW eviction via CDP
```

### Key design decisions

- **Echo server for header verification:** `chrome.declarativeNetRequest` modifies headers at the network stack level, which is invisible to Playwright's `page.route()`/`request.headers()` (different interception layer). A local echo server reflects received request headers in its JSON body, so tests assert on the actual modified headers. For response headers, the page reads them via `fetch()` (the page sees post-DNR headers).
- **Direct SW access:** `worker.evaluate(() => chrome.declarativeNetRequest.getDynamicRules())` and `chrome.storage.local.get()` run inside the service worker, bypassing the UI for fast, deterministic assertions.
- **Debounce handling:** UI rule edits debounce 400ms before `upsertGroup.mutate`. `waitForDnrRuleCount()` and `waitForStorage()` poll with 100ms intervals until the predicate passes (timeout 3s).
- **SW eviction:** MV3 service workers suspend after ~30s idle. `getActiveServiceWorker()` probes liveness and falls back to `waitForEvent('serviceworker')`. `evictServiceWorker()` uses CDP `ServiceWorker.stopAllWorkers` to simulate restart in the persistence test.
- **Confirm dialogs:** `page.on('dialog', d => d.accept())` is registered in the page fixture to auto-accept `confirm()` from delete buttons.

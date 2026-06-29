# AGENTS.md

This file provides guidance to AI coding agents when working with code
in this repository.

## Project Overview

This is boilerplate used for starting a new project targeting the browser.
It uses pnpm, Typescript, Vite, and ESlint with opinionated rules.

## Development Commands

Ensure the project compiles, lint checks, and unit tests pass when making
changes:
- Check compilation: `pnpm run typecheck`
- Check linting: `pnpm run lint`
- Run tests: `pnpm run test`
- Check all three: `pnpm run check`
- Build project: `pnpm run build`

## Visual Validation (Screenshots / Prints)

To inspect the rendered UI (light/dark mode, mobile layout, general layout),
capture a screenshot and view the resulting PNG. To inspect print layout,
capture a print-formatted PDF or PNG. Uses Playwright (Chromium). If a dev
server is already running it is reused; otherwise a temporary one is started
for the capture and stopped afterwards.

- Capture a screenshot: `pnpm screenshot [options]`
  - `--path <p>` route to capture (default `/`)
  - `--out <file>` output path (default `screenshots/screenshot.png`, or
    `screenshots/screenshot.pdf` with `--print` unless `--png` is set)
  - `--theme <light|dark>` color scheme (default `light`)
  - `--device <name>` Playwright device, e.g. `"iPhone 15"`, `"Pixel 7"`
  - `--width <n>` / `--height <n>` viewport size (ignored with `--device`)
  - `--full-page` capture the full scrollable page
  - `--print` output a US Letter print-formatted PDF instead of a PNG
  - `--png` output a PNG when used with `--print`
  - `--pages <range>` PDF page ranges, e.g. `"1-5, 8"` (requires `--print`)
  - `--wait <selector>` wait for a CSS selector before capturing
  - `--delay <ms>` extra settle delay before capturing
  - `--url <base>` target an explicit base URL (disables auto-start)

  Examples:
  ```sh
  pnpm screenshot --theme dark --out screenshots/dark.png
  pnpm screenshot --device "iPhone 15" --out screenshots/mobile.png
  pnpm screenshot --print --pages "1-2,4" --out screenshots/print.pdf
  pnpm screenshot --print --png --out screenshots/print.png
  ```

  Output goes to `screenshots/` (gitignored). After capturing, read the PNG or
  PDF to inspect the layout.

### End-to-end tests

Functional Playwright tests live in `e2e/*.e2e.ts` (separate from the Vitest
unit tests in `tests/`) and run on desktop + mobile viewports. They assert
behaviour/structure, not pixels, so they are stable across platforms and need
no committed baseline images. For visual checks, use `pnpm screenshot` above.

- Run e2e tests: `pnpm test:e2e`
- Interactive UI mode: `pnpm test:e2e:ui`

## Coding Conventions

- **Types & Interfaces**: PascalCase
- **Variables & Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### TypeScript Patterns

- **Use `interface`** for object shapes, especially extensible ones
- **Use `type`** for type aliases, unions, and tuples
- **Avoid enums** - prefer string literal unions with constants for type safety without runtime overhead
- **Use discriminated unions** with a `type` property for variant types
- **Import types separately** using `import type { ... }` for type-only imports

### Documentation

- **JSDoc required** on all exported interfaces, types, and functions
- **JSDoc encouraged** on complex internal functions and non-obvious logic
- **Property documentation** - use JSDoc `/** description */` above each interface property
- **Section headers** - use visual comment blocks for major sections in long files
  ```ts
  /* ========================================================= *\
   *  Half-edge data model                                     *
  \* ========================================================= */
  ```

### Function Declarations

- **Arrow functions** for internal/helper functions and factory functions. Lint rules
  require parens for all arrow functions.
- **Function keyword** for exported utility functions

### General Style

- **Avoid emoji** in code (comments, strings, etc.) unless explicitly required by the domain
- **Explicit return types** on exported functions
- **Readonly where appropriate** - use `readonly` modifier for immutable arrays/tuples
- **Callback naming** - use `on<Event>` pattern for callbacks (`onChange`, `onPuzzleChanged`)
- **Optional chaining** - prefer `?.` for potentially null/undefined values, enforced by lint rule
- **Nullish coalescing** - prefer `??` over `||` when dealing with null/undefined, enforced by lint rule

## Important Notes

- The package manager is **pnpm** (version pinned via `packageManager` field)
- TypeScript strict mode is enabled
- ESLint is configured with `@stylistic/eslint-plugin` for code style

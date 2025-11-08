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

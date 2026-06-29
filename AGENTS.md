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

### Mithril Components

- **Prefer closure components** for stateful components
  ```ts
  export const Puzzle: m.ClosureComponent<PuzzleAttrs> = () => {
    const state = {
      canvas: null as HTMLCanvasElement | null,
      isDragging: false,
    };

    return {
      oncreate: ({ dom, attrs }) => { ... },
      view: ({ attrs }) => { ... },
    };
  };
  ```
- **Object literal components** acceptable for simple, stateless components
- **Component state** should be stored in a single `state` object within the closure
- **Helper functions** should be defined within the component closure
- **Props interfaces** must extend `m.Attributes` and document all properties

#### Component Styling

- **Scope component CSS** - When creating component-specific CSS files, always scope styles with the component's root or wrapper class to prevent conflicts with other styles. E.g. use `.path-editor canvas { }` instead of `canvas { }`.
- **CSS file naming** - Use `ComponentName.css` matching the component name (e.g., `PathEditor.css` for `PathEditor` component)
- **Import CSS in component** - Import CSS files directly in the component's main file: `import './ComponentName.css'`

#### Event Handler Redraws

- **Consider redraw behavior** - When implementing component event handlers via Mithril convenience methods (`onclick`, `onchange`, etc.), consider whether they should automatically trigger a Mithril redraw based on the component's expected usage
- **Prevent unnecessary redraws** - If a handler doesn't change visual state or if the parent component will handle the redraw, prevent automatic redraws to improve performance:
  ```ts
  onchange: (e: Event & MithrilViewEvent) => {
    e.redraw = false;
    // parent will decide whether to redraw
    attrs.onChange(value);
  }
  ```
- **When to prevent redraws**:
  - Handler only calls a parent callback that will trigger its own redraw
  - Handler updates external state (not Mithril-managed)
  - High-frequency events (mousemove, scroll) where redraws are handled separately
  - Component uses a render loop or external rendering system (e.g., Paper.js, Canvas API)

#### Web Awesome Components

- **Use Web Awesome for standard UI controls** - For basic UI elements like buttons,
  checkboxes, color pickers, sliders, etc., prefer Web Awesome components over custom
  HTML implementations. See node_modules/@awesome.me/webawesome/dist/llms.txt for detailed
  documentation.
- **Benefits**: Web Awesome (derived from Shoelace) provides standardized, accessible UI components with consistent styling and behavior
- **Import pattern**: Import the component registration (side-effect) and the TypeScript type (if needed)
  ```ts
  // Import for registration (side-effect)
  import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
  // Import for TypeScript type if needed
  import type WaColorPicker from '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
  ```
- **Usage in Mithril**: Use the web component tag name and cast event targets to the component type
  ```ts
  m('wa-color-picker', {
    onchange: (e: Event & MithrilViewEvent) => {
      e.redraw = false;
      const picker = e.target as WaColorPicker;
      // Access picker properties/methods
      state.color = picker.value;
    },
  })
  ```
  Custom event names such as `wa-tab-show` can be attached using Mithril's convenience `on` prefix like this: `'onwa-tab-show': (e: WaTabShowEvent) => { ... }`
- **Documentation**: Consult component usage, properties, and events at https://webawesome.com/docs/components/

#### Web Awesome CSS Color Variables

Web Awesome provides a comprehensive color system with CSS variables for theming and consistent styling:

- **Color scales** - Each hue has 11 tints using the format `--wa-color-{hue}-{tint}` where tint ranges from 05 (near black) to 95 (near white)
  - Available hues: red, orange, yellow, green, cyan, blue, purple, magenta, gray, etc.
  - Example: `--wa-color-red-50`, `--wa-color-blue-70`
- **Accessibility contrast ratios** - Use tint differences to ensure WCAG 2.1 compliance:
  - Difference of 40 = minimum 3:1 contrast (large text/icons, AA)
  - Difference of 50 = minimum 4.5:1 contrast (normal text AA, large text AAA)
  - Difference of 60 = minimum 7:1 contrast (all text AAA)
- **Semantic groups** - Any hue can be mapped to semantic scales: `brand`, `neutral`, `success`, `warning`, `danger`
  - Use format `--wa-color-{group}-{tint}` (e.g., `--wa-color-brand-60`)
- **Surface colors** - Convey hierarchy through elevation:
  - `--wa-color-surface-raised` (closest to user, e.g., dialogs)
  - `--wa-color-surface-default` (base level)
  - `--wa-color-surface-lowered` (farthest, e.g., wells)
  - `--wa-color-surface-border` (borders and dividers)
- **Text colors** - Standard text elements (maintain 4.5:1 contrast with surfaces):
  - `--wa-color-text-normal` (primary text)
  - `--wa-color-text-quiet` (secondary text)
  - `--wa-color-text-link` (hyperlinks)
- **Semantic colors** - Contextual colors using format `--wa-color-{group}-{role}-{attention}`:
  - Groups: `brand`, `success`, `neutral`, `warning`, `danger`
  - Roles: `fill` (backgrounds), `border` (strokes), `on` (content on fills)
  - Attention levels: `quiet` (least), `normal`, `loud` (most)
  - Example: `--wa-color-danger-fill-loud` paired with `--wa-color-danger-on-loud`

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

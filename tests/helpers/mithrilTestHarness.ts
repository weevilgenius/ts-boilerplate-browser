import m from 'mithril';
import type { Attributes, ComponentTypes } from 'mithril';

/** Handle returned by {@link renderComponent} for interacting with the mounted component. */
export interface MountedComponent<TAttrs extends Attributes> {
  /** Root DOM node appended to the document body. */
  root: HTMLDivElement;

  /** Replace the component's attrs and trigger a synchronous redraw. */
  setAttrs: (next: TAttrs) => void;

  /** Force a synchronous Mithril redraw. */
  redraw: () => void;

  /** Unmount the component and remove the root element. */
  unmount: () => void;
}

/** Options for {@link renderComponent}. */
export interface MithrilRenderOptions<TAttrs extends Attributes> {
  /** Initial attrs passed to the component. */
  attrs?: TAttrs;

  /** Attach the root to a custom container instead of `document.body`. */
  container?: HTMLElement;
}

/**
 * Mounts a Mithril component for testing and provides helpers for cleanup and
 * attr updates.  All redraws are synchronous (`m.redraw.sync()`) so assertions
 * can run immediately after.
 */
export function renderComponent<TAttrs extends Attributes>(
  component: ComponentTypes<TAttrs, unknown>,
  options: MithrilRenderOptions<TAttrs> = {},
): MountedComponent<TAttrs> {
  const container = options.container ?? document.body;
  const root = document.createElement('div');
  container.appendChild(root);

  let currentAttrs = options.attrs ?? ({} as TAttrs);

  const wrapper: m.Component = {
    view: () => m(component, currentAttrs),
  };

  m.mount(root, wrapper);
  m.redraw.sync();

  return {
    root,

    setAttrs(nextAttrs: TAttrs) {
      currentAttrs = nextAttrs;
      m.redraw.sync();
    },

    redraw: () => m.redraw.sync(),

    unmount() {
      m.mount(root, null);
      root.remove();
    },
  };
}

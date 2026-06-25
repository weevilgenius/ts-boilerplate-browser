import { describe, it, expect, afterEach } from 'vitest';
import m from 'mithril';

// Register the Web Awesome components used by the example component.
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';
import { renderComponent, type MountedComponent } from './helpers/mithrilTestHarness';

/**
 * Example tests demonstrating the Mithril test harness (`renderComponent`)
 * with Web Awesome components.
 *
 * The harness mounts a component onto the document, drives synchronous redraws,
 * and tears everything down on `unmount`.  Use it as a template for testing
 * real components.  Browser APIs that happy-dom lacks but Web Awesome needs
 * (ResizeObserver, ElementInternals) are stubbed in `tests/helpers/matchers.ts`.
 */

/** A two-part joke whose answer is revealed by a `wa-button`. */
interface JokeAttrs {
  /** The setup, shown in the heading. */
  question: string;
  /** The punchline, revealed in a `wa-callout` on click. */
  answer: string;
}

const Joke: m.ClosureComponent<JokeAttrs> = () => {
  const state = { revealed: false };
  return {
    view: ({ attrs }) =>
      m('wa-card', [
        m('h1', { slot: 'header' }, attrs.question),
        state.revealed
          ? m('wa-callout', { variant: 'success' }, attrs.answer)
          : m(
            'wa-button',
            {
              variant: 'brand',
              onclick: () => { state.revealed = true; },
            },
            'Reveal the answer',
          ),
      ]),
  };
};

describe('renderComponent', () => {
  let mounted: MountedComponent<JokeAttrs>;

  const attrs: JokeAttrs = {
    question: 'Why did the chicken cross the road?',
    answer: 'To get to the other side!',
  };

  afterEach(() => mounted.unmount());

  it('renders the question and hides the answer', () => {
    mounted = renderComponent(Joke, { attrs });
    expect(mounted.root.querySelector('h1')?.textContent).toBe(attrs.question);
    expect(mounted.root.querySelector('wa-callout')).toBeNull();
    expect(mounted.root.querySelector('wa-button')).not.toBeNull();
  });

  it('re-renders when attrs change', () => {
    mounted = renderComponent(Joke, { attrs });
    mounted.setAttrs({ ...attrs, question: 'Knock, knock?' });
    expect(mounted.root.querySelector('h1')?.textContent).toBe('Knock, knock?');
  });

  it('reveals the answer after the button is clicked', () => {
    mounted = renderComponent(Joke, { attrs });
    // Dispatch a DOM event rather than calling wa-button.click(), whose shadow
    // DOM does not upgrade under happy-dom; this still fires Mithril's onclick.
    mounted.root.querySelector('wa-button')?.dispatchEvent(new Event('click', { bubbles: true }));
    // Mithril's auto-redraw does not run for synthetic happy-dom events, so
    // drive one synchronously via the harness to observe the updated state.
    mounted.redraw();
    expect(mounted.root.querySelector('wa-callout')?.textContent).toBe(attrs.answer);
  });
});

// Application entry point with routing
import m from 'mithril';

// Webawesome components
import { registerIconLibrary } from '@awesome.me/webawesome/dist/webawesome.js';
import "@awesome.me/webawesome/dist/styles/themes/default.css";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';

// CSS for this component
import './index.css';

// Lit (used by Web Awesome components) generates spurious update warnings in development mode only
// this does not affect production builds
if (import.meta.env.DEV) {
  console.log('silencing lit update warnings');
  const { LitElement } = await import('lit');
  LitElement.disableWarning?.('change-in-update');
}

// detect light/dark mode
function configureDarkLightTheme() {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function manageDarkLightTheme() {
    if (darkModeQuery.matches) {
      document.documentElement.classList.add('wa-dark');
    } else {
      document.documentElement.classList.remove('wa-dark');
    }
  }
  manageDarkLightTheme();
  darkModeQuery.addEventListener('change', manageDarkLightTheme);
}
configureDarkLightTheme();

// Configure Webawesome icons to use Material Symbols
registerIconLibrary('material', {
  resolver: (name) => {
    const match = name.match(/^(.*?)(_(rounded|sharp))?$/);
    if (match) {
      return `https://cdn.jsdelivr.net/npm/@material-symbols/svg-400@0.32.0/${match[3] ?? 'outlined'}/${match[1]}.svg`;
    }
    return '';
  },
  mutator: (svg) => svg.setAttribute('fill', 'currentColor'),
});

// home page component: a two-part joke revealed by a Web Awesome button
const App: m.ClosureComponent = () => {
  const state = {
    revealed: false,
  };

  return {
    view: () =>
      m('wa-card', { class: 'joke-card' }, [
        m('h1', { slot: 'header' }, 'Why did the chicken cross the road?'),
        state.revealed
          ? m('wa-callout', { variant: 'success' }, 'To get to the other side!')
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

// Ask Mithril to render the page, our componet gets placed into the root element.
// Mithril will rerender automatically after DOM event handlers defined in component
// views and also whenever m.redraw() is called.
m.mount(document.body, App);

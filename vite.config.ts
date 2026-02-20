import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { env } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(() => {

  const plugins: PluginOption[] = [];

  if (env.ANALYZE === '1') {
    // add the visualizer to see the module break-down
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap', // Report type: sunburst, treemap, network, raw-data, list, markdown, flamegraph
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  // strip HTML comments from index.html
  plugins.push(
    {
      name: 'strip-html-comments',
      transformIndexHtml(html) {
        return html.replace(/<!--[\s\S]*?-->\n?/g, '');
      },
    }
  );

  const config: UserConfig = {
    plugins,
    build: {
      // browser target
      target: 'baseline-widely-available',
      // build stand-alone source maps
      sourcemap: true,
      // Clean the output directory before each build.
      emptyOutDir: true,
      rollupOptions: {
        output: {

          // configure Rollup to break some libraries out into separate files
          // manualChunks: (id: string) => {
          //   if (id.includes('node_modules')) {
          //     if (/node_modules[/\\]mithril/.test(id)) {
          //       return 'mithril';
          //     }
          //     if (/node_modules[/\\]@awesome.me[/\\]webawesome[/\\]/.test(id)) {
          //       return 'webawesome';
          //     }
          //     if (/node_modules[/\\](lit|@lit|lit-html|lit-element)[/\\]/.test(id)) {
          //       return 'webawesome';
          //     }
          //     if (/node_modules[/\\]@floating-ui[/\\]/.test(id)) {
          //       return 'webawesome';
          //     }
          //   }
          //   // default: let Rollup decide
          // },

          // Optional, remove hashes from output filenames
          // entryFileNames: `assets/[name].js`,
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  };

  return config;
});

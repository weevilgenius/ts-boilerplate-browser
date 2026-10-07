/* ========================================================= *\
 *  Screenshot CLI                                           *
 *                                                           *
 *  Captures a screenshot, print PDF, or print PNG of the    *
 *  app for visual validation.                               *
 *                                                           *
 *  Starts a private temporary Vite server for each capture  *
 *  and stops it afterwards. --url uses an explicit server   *
 *  without starting or stopping it.                         *
 *                                                           *
 *  Usage:                                                   *
 *    pnpm screenshot [options]                              *
 *                                                           *
 *  Options:                                                 *
 *    --path <p>      Route to capture          (default /)  *
 *    --out <file>    Output path       (default screenshots/screenshot.png,
 *                                      screenshots/screenshot.pdf with --print
 *                                      unless --png is set)
 *    --theme <t>     light | dark              (default light)
 *    --device <d>    Playwright device name, e.g. "iPhone 15"
 *    --width <n>     Viewport width  (default 1280, ignored with --device)
 *    --height <n>    Viewport height (default 800, ignored with --device)
 *    --full-page     Capture the full scrollable page         *
 *    --print         Output a print-formatted PDF             *
 *    --png           Output PNG when used with --print        *
 *    --pages <range> PDF page ranges, e.g. "1-5, 8"           *
 *    --url <base>    Base URL to use; disables auto-start      *
 *    --wait <sel>    Wait for a CSS selector before capturing  *
 *    --delay <ms>    Extra settle delay before capturing       *
\* ========================================================= */

import { parseArgs } from 'node:util';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { chromium, devices } from '@playwright/test';
import { createServer } from 'vite';

/** US Letter at 96 CSS pixels per inch. */
const PRINT_PNG_VIEWPORT = { width: 816, height: 1056 };

const { values } = parseArgs({
  options: {
    path: { type: 'string', default: '/' },
    out: { type: 'string' },
    theme: { type: 'string', default: 'light' },
    device: { type: 'string' },
    width: { type: 'string', default: '1280' },
    height: { type: 'string', default: '800' },
    'full-page': { type: 'boolean', default: false },
    print: { type: 'boolean', default: false },
    png: { type: 'boolean', default: false },
    pages: { type: 'string' },
    url: { type: 'string' },
    wait: { type: 'string' },
    delay: { type: 'string' },
  },
});

const theme = values.theme === 'dark' ? 'dark' : 'light';
const fullPage = values['full-page'];
const print = values.print;
const printPng = print && values.png;
const pageRanges = values.pages?.trim();
const outPath = resolve(values.out ?? (print && !printPng ? 'screenshots/screenshot.pdf' : 'screenshots/screenshot.png'));

if (values.pages !== undefined && !print) {
  console.error('--pages can only be used with --print.');
  process.exit(1);
}
if (values.pages !== undefined && printPng) {
  console.error('--pages can only be used with print PDF output.');
  process.exit(1);
}
if (values.pages !== undefined && pageRanges === '') {
  console.error('--pages must not be empty.');
  process.exit(1);
}

// Resolve the device descriptor up front so a bad name fails fast.
const deviceName = values.device;
const deviceDescriptor = deviceName ? devices[deviceName] : undefined;
if (deviceName && !deviceDescriptor) {
  const available = Object.keys(devices).slice(0, 12).join(', ');
  console.error(`Unknown device "${deviceName}". Examples: ${available}, ...`);
  process.exit(1);
}

let server: Awaited<ReturnType<typeof createServer>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

try {
  let targetBaseUrl = values.url;
  if (targetBaseUrl === undefined) {
    server = await createServer({ server: { port: 0, host: '127.0.0.1' } });
    await server.listen();
    targetBaseUrl = server.resolvedUrls?.local[0];
    if (targetBaseUrl === undefined) {
      throw new Error('Vite did not report a listening URL.');
    }
    console.log(`Temporary Vite server listening at ${targetBaseUrl}`);
  } else {
    console.log(`Using explicit server at ${targetBaseUrl}`);
  }
  const targetUrl = new URL(values.path, targetBaseUrl).toString();
  browser = await chromium.launch();
  const context = await browser.newContext({
    colorScheme: theme,
    ...(printPng ? {} : deviceDescriptor),
    // An explicit --width/--height overrides the device viewport.
    ...(printPng
      ? { viewport: PRINT_PNG_VIEWPORT }
      : values.device ? {} : { viewport: { width: Number(values.width), height: Number(values.height) } }),
  });
  const page = await context.newPage();

  if (printPng) {
    await page.emulateMedia({ media: 'print' });
  }

  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  if (values.wait) {
    await page.waitForSelector(values.wait);
  }
  if (values.delay) {
    await page.waitForTimeout(Number(values.delay));
  }

  await mkdir(dirname(outPath), { recursive: true });
  if (printPng) {
    await page.screenshot({ path: outPath });
  } else if (print) {
    await page.pdf({
      path: outPath,
      format: 'Letter',
      printBackground: true,
      pageRanges,
    });
  } else {
    await page.screenshot({ path: outPath, fullPage });
  }

  console.log(`Captured ${targetUrl} (${theme}${deviceName ? `, ${deviceName}` : ''}${print ? ', print' : ''}${printPng ? ' PNG' : ''}) -> ${outPath}`);
} finally {
  try {
    await browser?.close();
  } finally {
    await server?.close();
  }
}

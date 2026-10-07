import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import { test, expect } from '@playwright/test';

const execFileAsync = promisify(execFile);

test('parallel screenshots own separate temporary servers', async ({ request, baseURL }, testInfo) => {
  const captures = await Promise.all(['first', 'second'].map(async (name) => {
    const { stdout } = await execFileAsync(process.execPath, [
      'scripts/screenshot.ts', '--out', testInfo.outputPath(`${name}.png`), '--delay', '500',
    ]);
    const url = /Temporary Vite server listening at (http:\/\/127\.0\.0\.1:\d+\/)/.exec(stdout)?.[1];
    if (url === undefined) {
      throw new Error(`Screenshot did not report its server URL: ${stdout}`);
    }
    expect(stdout).toContain(`Captured ${url}`);
    return url;
  }));

  expect(captures[0]).not.toBe(captures[1]);
  for (const url of captures) {
    expect(url).not.toBe(baseURL);
    await expect(fetch(url, { signal: AbortSignal.timeout(1_000) })).rejects.toThrow();
  }
  if (baseURL === undefined) {
    throw new Error('Playwright did not receive the Vite URL.');
  }
  const { stdout } = await execFileAsync(process.execPath, [
    'scripts/screenshot.ts', '--url', baseURL, '--out', testInfo.outputPath('explicit.png'),
  ]);
  expect(stdout).toContain(`Using explicit server at ${baseURL}`);
  expect(stdout).not.toContain('Temporary Vite server');
  // Explicitly borrowed servers must survive screenshot cleanup.
  expect((await request.get('/')).ok()).toBe(true);
});

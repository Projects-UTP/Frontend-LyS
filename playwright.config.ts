import { defineConfig } from '@playwright/test';
import process from 'node:process';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  use: {
    headless: Boolean(process.env.CI),
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});

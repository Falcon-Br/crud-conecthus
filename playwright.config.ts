import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 7000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run build -w backend && npm run db:migrate && npm run start -w backend',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        DATABASE_URL: 'postgresql://wenlock:wenlock_test@127.0.0.1:54330/wenlock_test',
        PORT: '3001',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'npm run dev -w frontend -- --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30000,
      env: { API_TARGET: 'http://127.0.0.1:3001' },
    },
  ],
});

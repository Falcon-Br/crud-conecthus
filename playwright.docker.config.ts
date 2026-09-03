import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

// Dedicated Compose project/volume; never point this suite at the demo database.
export default defineConfig({
  ...baseConfig,
  webServer: undefined,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:8081' },
});

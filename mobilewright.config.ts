import { defineConfig } from 'mobilewright';

export default defineConfig({
  platform: 'android',
  bundleId: 'com.xpedeon.xpedeonapprovals',
  // installApps: ['./apps/app-release.apk'],
  deviceName: /Pixel 7/,
  // timeout: 240_000,
  actionTimeout: 30_000,

  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
  ],


  retries: 0,

  // globalTeardown: './global-teardown.ts',
});

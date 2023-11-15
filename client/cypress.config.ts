import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'cypress';

const { combinedEnv } = loadEnvConfig(process.cwd());
export default defineConfig({
  env: combinedEnv,
  projectId: 'MapHub',
  e2e: {
    baseUrl: 'http://localhost:3000',
    retries: {
      runMode: 3,
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    video: false,
    screenshotOnRunFailure: false,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.tsx',
    specPattern: 'cypress/components/**/*.cy.{js,jsx,ts,tsx}',
    viewportHeight: 1080,
    viewportWidth: 1920,
    video: false,
    screenshotOnRunFailure: false,
  },
});

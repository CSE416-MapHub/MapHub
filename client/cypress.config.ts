import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'cypress';
import * as fs from 'fs';
import path from 'path';

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
      on('task', {
        emptyDirectory(folderName: string) {
          console.log('emptying folder %s', folderName);

          return new Promise((resolve, reject) => {
            fs.readdir(folderName, (err, files) => {
              if (err) throw err;

              for (const file of files) {
                fs.unlink(path.join(folderName, file), err => {
                  if (err) reject(err);
                });
              }
              resolve(null);
            });
            // rmdir(folderName, { maxRetries: 10, recursive: true }, err => {
            //   if (err) {
            //     console.error(err);
            //     return reject(err);
            //   }
            //   resolve(null);
            // });
          });
        },
      });
    },
    trashAssetsBeforeRuns: true,
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

import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['utils.js'],
  },
})

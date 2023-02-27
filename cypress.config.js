const { defineConfig } = require('cypress')
const { getSpecs } = require('.')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      console.log('e2e setupNodeEvents')
      const specs = getSpecs(config)
      console.log('found specs')
      console.log(specs.join(','))
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['utils.js'],
  },
  component: {
    specPattern: 'test-components/**/*.cy.{js,ts}',
  },
})

const { defineConfig } = require('cypress')
const { getSpecs, getTests } = require('.')

module.exports = defineConfig({
  fixturesFolder: false,
  defaultBrowser: 'electron',
  e2e: {
    setupNodeEvents(on, config) {
      console.log('e2e setupNodeEvents')
      const specs = getSpecs(config)
      console.log('found specs')
      console.log(specs.join(','))

      const tests = getTests(specs)
      console.log('found tests')
      console.log(tests)
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['utils.js'],
  },
  component: {
    specPattern: 'test-components/**/*.cy.{js,ts}',
  },
})

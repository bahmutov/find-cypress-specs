const { defineConfig } = require('cypress')
const { getSpecs, getTests } = require('./src')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    async setupNodeEvents(on, config) {
      console.log('e2e setupNodeEvents')
      const specs = await getSpecs(config)
      console.log('found specs')
      console.log(specs.join(','))

      const tests = await getTests(specs)
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

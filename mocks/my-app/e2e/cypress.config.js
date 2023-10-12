const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // baseUrl, etc
    supportFile: false,
    fixturesFolder: false,
    // Cypress likes path with respect to the root folder, sigh
    specPattern: 'mocks/my-app/e2e/e2e-tests/*.cy.js',
    setupNodeEvents(on, config) {
      console.log('project root is %s', config.projectRoot)
      console.log('working directory is %s', process.cwd())

      on('after:spec', (spec) => {
        console.log('spec %s finished', spec.relative)
      })
    },
  },
})

const debug = require('debug')('find-cypress-specs')

function findCypressSpecs(options = {}) {
  const defaults = {
    integrationFolder: 'cypress/integration',
    testFiles: '**/*.js',
    ignoreTestFiles: [],
  }
  const options = {
    ...options,
    defaults,
  }
  debug('options %o', options)
}

module.exports = {
  findCypressSpecs,
}

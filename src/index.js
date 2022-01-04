const debug = require('debug')('find-cypress-specs')
const fs = require('fs')

/**
 * Reads the cypress config file and returns the relevant properties
 */
function getConfig(filename = 'cypress.json') {
  const s = fs.readFileSync(filename, 'utf8')
  const config = JSON.parse(s)
  const options = {
    integrationFolder: config.integrationFolder,
    testFiles: config.testFiles,
    ignoreTestFiles: config.ignoreTestFiles,
  }
  debug('got config options %o', options)
  return options
}

function findCypressSpecs(opts = {}) {
  const defaults = {
    integrationFolder: 'cypress/integration',
    testFiles: '**/*.js',
    ignoreTestFiles: [],
  }
  const options = {
    ...defaults,
    ...opts,
  }
  debug('options %o', options)
  return []
}

module.exports = {
  getConfig,
  findCypressSpecs,
}

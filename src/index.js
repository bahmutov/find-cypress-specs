const debug = require('debug')('find-cypress-specs')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const minimatch = require('minimatch')

const MINIMATCH_OPTIONS = { dot: true, matchBase: true }

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
    integrationFolder: opts.integrationFolder || defaults.integrationFolder,
    testFiles: opts.testFiles || defaults.testFiles,
    ignoreTestFiles: opts.ignoreTestFiles || defaults.ignoreTestFiles,
  }
  debug('options %o', options)

  const files = globby.sync(options.testFiles, {
    sort: true,
    cwd: options.integrationFolder,
    ignore: options.ignoreTestFiles,
  })
  debug('found %d file(s) %o', files.length, files)

  // go through the files again and eliminate files that match
  // the ignore patterns

  // a function which returns true if the file does NOT match
  // all of our ignored patterns
  const doesNotMatchAllIgnoredPatterns = (file) => {
    // using {dot: true} here so that folders with a '.' in them are matched
    // as regular characters without needing an '.' in the
    // using {matchBase: true} here so that patterns without a globstar **
    // match against the basename of the file
    return options.ignoreTestFiles.every((pattern) => {
      return !minimatch(file, pattern, MINIMATCH_OPTIONS)
    })
  }

  const filtered = files.filter(doesNotMatchAllIgnoredPatterns)
  debug('filtered specs %o', filtered)

  // return spec files with the added integration folder prefix
  return filtered.map((file) => path.join(options.integrationFolder, file))
}

function getSpecs() {
  const options = getConfig()
  const specs = findCypressSpecs(options)
  return specs
}

module.exports = {
  getSpecs,
  // individual utilities
  getConfig,
  findCypressSpecs,
}

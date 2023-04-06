// @ts-check
const debug = require('debug')('find-cypress-specs')
const { getSpecs, getTests } = require('.')

/**
 * Finds all E2E and component tests and returns totals
 */
function getTestCounts() {
  debug('finding all e2e specs')
  const e2eSpecs = getSpecs(undefined, 'e2e')
  debug('found %d e2e specs', e2eSpecs.length)
  debug('finding all component specs')
  const componentSpecs = getSpecs(undefined, 'component')
  debug('found %d component specs', componentSpecs.length)

  debug('counting all e2e tests')
  const { jsonResults: e2eResults } = getTests(e2eSpecs)
  debug(e2eResults)
  let nE2E = 0
  Object.keys(e2eResults).forEach((filename) => {
    const n = e2eResults[filename].counts.tests
    nE2E += n
  })
  debug('found %d E2E tests', nE2E)

  debug('counting all component tests')
  const { jsonResults: componentResults } = getTests(componentSpecs)
  debug(componentResults)
  let nComponent = 0
  Object.keys(componentResults).forEach((filename) => {
    const n = componentResults[filename].counts.tests
    nComponent += n
  })
  debug('found %d component tests', nComponent)
  return { nE2E, nComponent }
}

module.exports = { getTestCounts }

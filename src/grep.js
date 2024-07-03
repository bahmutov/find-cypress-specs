const debug = require('debug')('find-cypress-specs')

/**
 * Recursively checks the tests structure to see
 * if any of the leaf test objects have a name that includes
 * any of the given strings
 */
function checkIncludesTestTitle(tests, greps) {
  if (!tests) {
    return false
  }
  debug('greps', greps)
  return tests.some((test) => {
    if (test.type === 'test' && test.name) {
      debug('checking test "%s"', test.name)
      return greps.some((grep) => test.name.includes(grep))
    } else if (test.type === 'suite') {
      debug('checking suite "%s"', test.name)
      return (
        checkIncludesTestTitle(test.tests, greps) ||
        checkIncludesTestTitle(test.suites, greps)
      )
    } else if (Array.isArray(test.tests)) {
      return checkIncludesTestTitle(test.tests, greps)
    } else if (Array.isArray(test.suites)) {
      return checkIncludesTestTitle(test.suites, greps)
    }
  })
}

/**
 * returns a list of specs where any test title contains the given string.
 * Leaves the original structure intact.
 * @param {object} jsonResults - parsed JSON spec file structure
 * @param {string} grep - comma-separated list of strings to filter by
 * @returns {string[]} - list of spec filenames
 */
function filterByGrep(jsonResults, grep) {
  const result = []
  const greps = grep
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  Object.keys(jsonResults).forEach((specFilename) => {
    debug('checking spec "%s"', specFilename)
    const spec = jsonResults[specFilename]
    if (checkIncludesTestTitle(spec.tests, greps)) {
      result.push(specFilename)
    }
  })

  return result
}

module.exports = { filterByGrep }

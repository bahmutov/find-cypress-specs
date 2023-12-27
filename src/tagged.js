const debug = require('debug')('find-cypress-specs:tagged')
const { addCounts } = require('./count')

function arraysOverlap(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false
  }

  if (a.length < b.length) {
    return a.some((item) => b.includes(item))
  } else {
    return b.some((item) => a.includes(item))
  }
}

function combineTags(tags, requiredTags) {
  if (tags && requiredTags) {
    return [].concat(tags).concat(requiredTags)
  }
  if (tags) {
    return [...tags]
  }
  if (requiredTags) {
    return [...requiredTags]
  }
}

// note: modifies the tests in place
function pickTaggedTests(tests, tag) {
  if (!Array.isArray(tests)) {
    return false
  }
  const tags = Array.isArray(tag) ? tag : [tag]
  const filteredTests = tests.filter((test) => {
    if (test.type === 'test') {
      const allTags = combineTags(test.tags, test.requiredTags)
      return allTags && arraysOverlap(allTags, tags)
    } else if (test.type === 'suite') {
      const allTags = combineTags(test.tags, test.requiredTags)
      debug('allTags %o', allTags)
      if (allTags && arraysOverlap(allTags, tags)) {
        return true
      }

      // maybe there is some test inside this suite
      // with the tag? Filter all other tests
      return (
        pickTaggedTests(test.tests, tags) || pickTaggedTests(test.suites, tags)
      )
    }
  })
  tests.length = 0
  tests.push(...filteredTests)
  return filteredTests.length > 0
}

// note: modifies the tests in place
function leavePendingTests(tests) {
  if (!Array.isArray(tests)) {
    return false
  }
  const filteredTests = tests.filter((test) => {
    if (test.type === 'test') {
      return test.pending === true
    } else if (test.type === 'suite') {
      // maybe there is some test inside this suite
      // with the tag? Filter all other tests
      return leavePendingTests(test.tests) || leavePendingTests(test.suites)
    }
  })
  tests.length = 0
  tests.push(...filteredTests)
  return filteredTests.length > 0
}

function removeEmptyNodes(json) {
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename].tests
    if (!fileTests.length) {
      delete json[filename]
    }
  })
  return json
}

/**
 * Takes an object of tests collected from all files,
 * and removes all tests that do not have the given tag applied.
 * Modifies the given object in place.
 */
function pickTaggedTestsFrom(json, tag) {
  // console.log(JSON.stringify(json, null, 2))
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename].tests
    debug('picking tagged tests from %s', filename)
    pickTaggedTests(fileTests, tag)
  })

  const result = removeEmptyNodes(json)
  addCounts(result)
  return result
}

/**
 * Takes an object of tests collected from all files,
 * and leaves only the pending tests.
 * Modifies the given object in place.
 */
function leavePendingTestsOnly(json) {
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename].tests
    leavePendingTests(fileTests)
  })

  const result = removeEmptyNodes(json)
  addCounts(result)
  return result
}

module.exports = {
  arraysOverlap,
  pickTaggedTestsFrom,
  removeEmptyNodes,
  pickTaggedTests,
  leavePendingTestsOnly,
}

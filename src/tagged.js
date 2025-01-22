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

/**
 * @param {string[]} tagExpressions
 */
function preprocessAndTags(tagExpressions) {
  return tagExpressions.map((tagExpression) => {
    if (tagExpression.includes('+')) {
      return tagExpression.split('+')
    }
    return tagExpression
  })
}

/**
 * Tag expressions can be a single tag, like `@user`
 * or a combination of tags, like `@user+@smoke` to match using AND
 * @param {string[]} effectiveTestTags
 * @param {string[]} tagExpressions
 */
function doTagsMatch(effectiveTestTags, tagExpressions) {
  const orTags = preprocessAndTags(tagExpressions)

  debug('doTagsMatch', { effectiveTestTags, orTags })

  return orTags.some((orTag) => {
    if (Array.isArray(orTag)) {
      return orTag.every((tag) => effectiveTestTags.includes(tag))
    }
    return effectiveTestTags.includes(orTag)
  })
}

/**
 * Finds all tests tagged with specific tag(s)
 * @param {object[]} tests List of tests
 * @param {string|string[]} tag Tag or array of tags to filter by
 * @param {string[]} effectiveTags List of effective test tags from the parents
 * @warning modifies the tests in place
 */
function pickTaggedTests(tests, tag, effectiveTags = []) {
  if (!Array.isArray(tests)) {
    return false
  }
  const tags = Array.isArray(tag) ? tag : [tag]
  const filteredTests = tests.filter((test) => {
    if (test.type === 'test') {
      // TODO: combine all tags plus effective tags
      const combinedTestTags = combineTags(test.tags, test.requiredTags)
      const effectiveTestTags = combineTags(combinedTestTags, effectiveTags)
      if (effectiveTestTags) {
        if (doTagsMatch(effectiveTestTags, tags)) {
          return true
        }
      }
    } else if (test.type === 'suite') {
      const combinedTestTags = combineTags(test.tags, test.requiredTags)
      const effectiveTestTags = combineTags(combinedTestTags, effectiveTags)
      if (effectiveTestTags) {
        if (doTagsMatch(effectiveTestTags, tags)) {
          return true
        }
      }

      // maybe there is some test inside this suite
      // with the tag? Filter all other tests
      // make sure the copy is non-destructive to the current array
      const suiteTags = [...effectiveTestTags]
      return (
        pickTaggedTests(test.tests, tags, suiteTags) ||
        pickTaggedTests(test.suites, tags, suiteTags)
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
 * @param {object} json Processed tests as a json tree
 * @param {string|string[]} tag Tag or array of tags to filter by
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
  preprocessAndTags,
  doTagsMatch,
}

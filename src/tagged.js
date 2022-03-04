// note: modifies the tests in place
function pickTaggedTests(tests, tag) {
  if (!Array.isArray(tests)) {
    return false
  }
  const filteredTests = tests.filter((test) => {
    if (test.type === 'test') {
      return test.tags && test.tags.includes(tag)
    } else if (test.type === 'suite') {
      if (test.tags && test.tags.includes(tag)) {
        return true
      }

      // maybe there is some test inside this suite
      // with the tag? Filter all other tests
      return (
        pickTaggedTests(test.tests, tag) || pickTaggedTests(test.suites, tag)
      )
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
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename].tests
    pickTaggedTests(fileTests, tag)
  })

  return removeEmptyNodes(json)
}

module.exports = { pickTaggedTestsFrom, removeEmptyNodes, pickTaggedTests }

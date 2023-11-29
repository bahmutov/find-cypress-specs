/**
 * For each file and each
 */
function addCounts(json) {
  Object.keys(json).forEach((filename) => {
    const fileInfo = json[filename]
    if (!fileInfo.counts) {
      fileInfo.counts = {
        tests: 0,
        pending: 0,
      }
    }

    fileInfo.counts.tests =
      countTests(fileInfo.tests) + countTests(fileInfo.suites)
    fileInfo.counts.pending =
      countPendingTests(fileInfo.tests) + countPendingTests(fileInfo.suites)
  })
}

function countTests(testsOrSuites) {
  if (!testsOrSuites) {
    return 0
  }

  return testsOrSuites.reduce((count, test) => {
    if (test.type === 'test') {
      return count + 1
    } else if (test.type === 'suite') {
      return count + countTests(test.tests) + countTests(test.suites)
    }
  }, 0)
}

function countPendingTests(testsOrSuites) {
  if (!testsOrSuites) {
    return 0
  }

  return testsOrSuites.reduce((count, test) => {
    if (test.type === 'test') {
      return test.pending ? count + 1 : count
    } else if (test.type === 'suite') {
      if (test.pending) {
        // all tests inside should count as pending
        return count + countTests(test.tests) + countTests(test.suites)
      }

      return (
        count + countPendingTests(test.tests) + countPendingTests(test.suites)
      )
    }
  }, 0)
}

/**
 * Goes through the object with all specs and adds up
 * all test counts to find the total number of tests
 * and the total number of pending tests
 */
function sumTestCounts(allInfo) {
  const counts = {
    tests: 0,
    pending: 0,
  }
  Object.keys(allInfo).forEach((fileName) => {
    const fileInfo = allInfo[fileName]
    counts.tests += fileInfo.counts.tests
    counts.pending += fileInfo.counts.pending
  })

  return counts
}

module.exports = { addCounts, sumTestCounts }

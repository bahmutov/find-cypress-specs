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

module.exports = { addCounts }

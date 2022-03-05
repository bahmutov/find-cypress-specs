const pluralize = require('pluralize')
const { formatTestList } = require('find-test-names')

/**
 * Outputs a string representation of the json test results object,
 * like a tree of suites and tests.
 */
function stringFileTests(fileName, fileInfo) {
  const testCount = pluralize('test', fileInfo.counts.tests, true)
  const headerLine = fileInfo.counts.pending
    ? `${fileName} (${testCount}, ${fileInfo.counts.pending} pending)`
    : `${fileName} (${testCount})`

  const body = formatTestList(fileInfo.tests)

  return headerLine + '\n' + body + '\n'
}

function stringAllInfo(allInfo) {
  let fileCount = 0
  let testCount = 0
  let pendingTestCount = 0

  const allInfoString = Object.keys(allInfo)
    .map((fileName) => {
      const fileInfo = allInfo[fileName]
      fileCount += 1
      testCount += fileInfo.counts.tests
      pendingTestCount += fileInfo.counts.pending
      return stringFileTests(fileName, fileInfo)
    })
    .join('\n')

  // footer line is something like
  // found 2 specs (4 tests, 1 pending)
  let footer = `found ${pluralize('spec', fileCount, true)}`
  const testWord = pluralize('test', testCount, true)
  if (pendingTestCount) {
    footer += ` (${testWord}, ${pendingTestCount} pending)`
  } else {
    footer += ` (${testWord})`
  }

  return allInfoString + '\n' + footer
}

module.exports = {
  stringFileTests,
  stringAllInfo,
}

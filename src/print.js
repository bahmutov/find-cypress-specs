const pluralize = require('pluralize')
const { formatTestList } = require('find-test-names')

/**
 * Outputs a string representation of the json test results object,
 * like a tree of suites and tests.
 */
function stringFileTests(fileName, fileInfo) {
  const testCount = pluralize('test', fileInfo.counts.tests, true)
  const headerLine = fileInfo.counts.pending
    ? `${fileName} (${testCount} ${fileInfo.counts.pending} pending)`
    : `${fileName} (${testCount})`

  const body = formatTestList(fileInfo.tests)

  return headerLine + '\n' + body + '\n'
}

function stringAllInfo(allInfo) {
  const allInfoString = Object.keys(allInfo)
    .map((fileName) => {
      return stringFileTests(fileName, allInfo[fileName])
    })
    .join('\n')

  return allInfoString
}

module.exports = {
  stringFileTests,
  stringAllInfo,
}

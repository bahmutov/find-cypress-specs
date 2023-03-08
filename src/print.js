const pluralize = require('pluralize')
const { formatTestList } = require('find-test-names')

/**
 * Outputs a string representation of the json test results object,
 * like a tree of suites and tests.
 */
function stringFileTests(fileName, fileInfo, tagged) {
  if (tagged) {
    const headerLine = fileName;
  return headerLine
  } else {
    const testCount = pluralize('test', fileInfo.counts.tests, true)
    const headerLine = fileInfo.counts.pending
      ? `${fileName} (${testCount}, ${fileInfo.counts.pending} pending)`
      : `${fileName} (${testCount})`
  
    // console.log(fileInfo.tests)
    const body = formatTestList(fileInfo.tests)
  
    return headerLine + '\n' + body + '\n'
  }
}

function stringAllInfo(allInfo, tagged) {
  let fileCount = 0
  let testCount = 0
  let pendingTestCount = 0

  if (!tagged) {
    const allInfoString = Object.keys(allInfo)
    .map((fileName) => {
      const fileInfo = allInfo[fileName]
      fileCount += 1
      testCount += fileInfo.counts.tests
      pendingTestCount += fileInfo.counts.pending
      return stringFileTests(fileName, fileInfo, tagged)
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
  } else {
    const allInfoString = Object.keys(allInfo)
    .map((fileName) => {
      const fileInfo = allInfo[fileName]
      return stringFileTests(fileName, fileInfo, tagged)
    })
    .join(',')

    return allInfoString
  }
}

module.exports = {
  stringFileTests,
  stringAllInfo,
}
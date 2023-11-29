const pluralize = require('pluralize')
const { formatTestList } = require('find-test-names')
const { sumTestCounts } = require('./count')

/**
 * Outputs a string representation of the json test results object,
 * like a tree of suites and tests.
 */
function stringFileTests(fileName, fileInfo, tagged) {
  if (tagged) {
    const headerLine = fileName
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
  if (!tagged) {
    let fileCount = 0
    let testCount = 0
    let pendingTestCount = 0
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

function getJustTheTestNames(tests, parentName = '', justNames = []) {
  // console.log(tests)
  // console.log(justNames)
  // console.log('parent name "%s"', parentName)

  if (tests.type === 'test') {
    justNames.push(parentName + tests.name)
    return
  } else if (tests.type === 'suite') {
    const prefix = parentName
      ? parentName + tests.name + ' / '
      : tests.name + ' / '
    getJustTheTestNames(tests.tests, prefix, justNames)
    if (tests.suites) {
      tests.suites.forEach((suite) => {
        getJustTheTestNames(suite, prefix, justNames)
      })
    }
    return
  }

  // tests can include regular tests plus suites nodes
  tests.forEach((testOrSuite) => {
    getJustTheTestNames(testOrSuite, parentName, justNames)
  })
  return justNames
}

/**
 * Returns a single string with all specs and test names
 * as a Markdown table
 * @returns {string}
 */
function stringMarkdownTests(allInfo) {
  const counts = sumTestCounts(allInfo)
  const specNames = Object.keys(allInfo)
  const specWord = pluralize('Spec', specNames.length, true)
  const testWord = pluralize('test', counts.tests, true)

  const title = `| ${specWord} with ${testWord} |\n| --- |\n`
  const allInfoString =
    title +
    specNames
      .map((fileName) => {
        const fileInfo = allInfo[fileName]
        const n = fileInfo.counts.tests
        // console.log(fileInfo)

        let specTest =
          '| **`' + fileName + '`**' + ` (${n} ${pluralize('test', n)}) |\n`
        const testNames = getJustTheTestNames(fileInfo.tests)
        testNames.forEach((name) => {
          specTest += '| `' + name + '` |\n'
        })
        return specTest
      })
      .join('')

  return allInfoString
}

module.exports = {
  stringFileTests,
  stringAllInfo,
  stringMarkdownTests,
}

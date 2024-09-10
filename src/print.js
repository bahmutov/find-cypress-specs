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

function getJustTheTestMarkdown(tests, parentName = '', markdown = []) {
  if (!tests) {
    return
  }

  const name = parentName + tests.name

  if (tests.type === 'test') {
    const tags = tests?.tags?.join(', ') ?? ''

    markdown.push(`| \`${name}\` | ${tags} |`)

    return
  } else if (tests.type === 'suite') {
    const prefix = `${name} / `

    getJustTheTestMarkdown(tests.tests, prefix, markdown)

    tests.suites?.forEach((suite) => {
      getJustTheTestMarkdown(suite, prefix, markdown)
    })

    return
  }

  // tests can include regular tests plus suites nodes
  tests.forEach((testOrSuite) =>
    getJustTheTestMarkdown(testOrSuite, parentName, markdown),
  )

  return markdown
}

/**
 * Returns a single string with all specs and test names
 * as a Markdown table
 * @returns {string}
 */
function stringMarkdownTests(allInfo) {
  const testWord = (counts) => pluralize('test', counts.tests, true)

  const counts = sumTestCounts(allInfo)
  const specNames = Object.keys(allInfo)
  const specWord = pluralize('Spec', specNames.length, true)

  const markdown = [
    `| ${specWord} with ${testWord(counts)} | Tags |`,
    '| --- | --- |',
  ]

  specNames.forEach((fileName) => {
    const { counts, tests } = allInfo[fileName]

    markdown.push(`| **\`${fileName}\`** (${testWord(counts)}) ||`)
    markdown.push(...getJustTheTestMarkdown(tests))
  })

  return markdown.join('\n')
}

module.exports = {
  stringFileTests,
  stringAllInfo,
  stringMarkdownTests,
}

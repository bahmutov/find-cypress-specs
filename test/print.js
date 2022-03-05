const pluralize = require('pluralize')
const test = require('ava')
const { formatTestList } = require('find-test-names')
const input = require('./tagged.json')

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

test('prints tests from one file', (t) => {
  t.plan(2)
  const filename = 'cypress/e2e/featureA/user.js'
  const fileInfo = input[filename]
  const copy = JSON.parse(JSON.stringify(fileInfo))
  const str = stringFileTests(filename, copy)

  // does not change the input
  t.deepEqual(fileInfo, copy)
  // console.log(str)
  t.snapshot(str)
})

test('prints tests with inner suites', (t) => {
  t.plan(2)
  const filename = 'cypress/e2e/spec.js'
  const fileInfo = input[filename]
  const copy = JSON.parse(JSON.stringify(fileInfo))
  const str = stringFileTests(filename, copy)

  // does not change the input
  t.deepEqual(fileInfo, copy)
  // console.log(str)
  t.snapshot(str)
})

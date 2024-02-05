const {
  stringFileTests,
  stringAllInfo,
  stringMarkdownTests,
} = require('../src/print')
const test = require('ava')
const input = require('./tagged.json')

test('prints tests from one file', async (t) => {
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

test('prints tests with inner suites', async (t) => {
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

test('prints all tests', async (t) => {
  t.plan(2)
  const copy = JSON.parse(JSON.stringify(input))
  const str = stringAllInfo(copy)

  // does not change the input
  t.deepEqual(input, copy)
  // console.log(str)
  t.snapshot(str)
})

test('prints markdown', async (t) => {
  t.plan(2)
  const copy = JSON.parse(JSON.stringify(input))
  const str = stringMarkdownTests(copy)

  // does not change the input
  t.deepEqual(input, copy)
  // console.log(str)
  t.snapshot(str)
})

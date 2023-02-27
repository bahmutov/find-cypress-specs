const test = require('ava')
const { getTests } = require('../..')

test('finds the specs and the tests', (t) => {
  t.plan(2)
  const { jsonResults, tagTestCounts } = getTests()
  t.deepEqual(tagTestCounts, {}, 'no tag counts')
  t.snapshot(jsonResults, 'json object with tests')
})

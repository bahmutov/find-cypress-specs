const test = require('ava')
const { getTests } = require('../..')

test('finds the specs and the tests', async (t) => {
  t.plan(2)
  const { jsonResults, tagTestCounts } = await getTests()
  t.deepEqual(tagTestCounts, {}, 'no tag counts')
  t.snapshot(jsonResults, 'json object with tests')
})

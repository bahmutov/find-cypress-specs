const test = require('ava')
const input = require('./tagged.json')

/**
 * For each file and each
 */
function addCounts(json) {}

test('counts all tests', (t) => {
  t.plan(0)
  const json = JSON.parse(JSON.stringify(input))
  addCounts(json)
  console.dir(json, { depth: null })
})

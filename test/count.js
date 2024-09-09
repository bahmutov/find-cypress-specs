const test = require('ava')
const input = require('./tagged.json')
const { addCounts } = require('../src/count')

test('counts all tests', (t) => {
  t.plan(2)
  const json = JSON.parse(JSON.stringify(input))
  addCounts(json)
  // console.dir(json, { depth: null })
  t.deepEqual(json['cypress/e2e/spec.js'].counts, {
    tests: 3,
    pending: 0,
  })
  t.deepEqual(json['cypress/e2e/featureA/user.js'].counts, {
    tests: 2,
    pending: 1,
  })
})

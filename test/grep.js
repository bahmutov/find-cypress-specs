const test = require('ava')
const input = require('./tagged.json')
const { filterByGrep } = require('../src/grep')

test('filters tests by part of one title', (t) => {
  t.plan(1)
  const result = filterByGrep(input, 'to be written')
  t.deepEqual(result, ['cypress/e2e/featureA/user.js'])
})

test('filters tests by several parts', (t) => {
  t.plan(1)
  const result = filterByGrep(input, 'something,written')
  t.deepEqual(result, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

test('trims the grep strings', (t) => {
  t.plan(1)
  const result = filterByGrep(input, ' something , written')
  t.deepEqual(result, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

test('skips empty grep strings', (t) => {
  t.plan(1)
  const result = filterByGrep(input, ' something ,,,, written, ,')
  t.deepEqual(result, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

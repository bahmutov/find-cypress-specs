const test = require('ava')
const { getSpecs } = require('..')

test('basic', (t) => {
  t.plan(1)
  const specs = getSpecs()
  t.deepEqual(specs, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

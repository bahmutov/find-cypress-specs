const test = require('ava')
const { getSpecs, findCypressSpecs } = require('..')

test('basic', (t) => {
  t.plan(1)
  const specs = getSpecs()
  t.deepEqual(specs, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

test('string ignore pattern', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    integrationFolder: 'cypress/e2e',
    testFiles2: '**/*.js',
    ignoreTestFiles: 'utils.js',
  })
  t.deepEqual(specs, ['cypress/e2e/spec.js', 'cypress/e2e/featureA/user.js'])
})

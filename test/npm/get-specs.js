const test = require('ava')
const { getSpecs } = require('../..')

test('finds the specs', (t) => {
  t.plan(1)
  const specs = getSpecs()
  t.deepEqual(specs, [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

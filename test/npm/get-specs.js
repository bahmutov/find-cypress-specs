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

test('finds the specs with custom spec pattern', (t) => {
  t.plan(1)
  const specs = getSpecs({
    e2e: {
      specPattern: '*/e2e/featureA/*.cy.ts',
    },
  })
  t.deepEqual(specs, ['cypress/e2e/featureA/user.cy.ts'])
})

test('returns an empty list for unknown spec type', (t) => {
  t.plan(1)
  const specs = getSpecs({}, 'api')
  t.deepEqual(specs, [])
})

test('returns a list of component specs', (t) => {
  t.plan(1)
  const specs = getSpecs(undefined, 'component')
  t.deepEqual(specs, [
    'test-components/comp1.cy.js',
    'test-components/comp2.cy.ts',
  ])
})

test('finds the specs passing resolved config', (t) => {
  // imagine we are getting the config in the "e2e setupNodeEvents"
  const config = {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: '*.hot-update.js',
    testingType: 'e2e',
  }
  t.plan(1)
  const specs = getSpecs(config)
  t.deepEqual(specs, [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

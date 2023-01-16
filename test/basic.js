const test = require('ava')
const { getSpecs, findCypressSpecs } = require('..')

test('basic', (t) => {
  t.plan(1)
  const specs = getSpecs()
  t.deepEqual(specs, [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('string ignore pattern v9', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    integrationFolder: 'cypress/e2e',
    testFiles2: '**/*.js',
    ignoreTestFiles: 'utils.js',
  })
  t.deepEqual(specs, [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('string ignore pattern v10', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    e2e: {
      specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
      excludeSpecPattern: ['utils.js'],
    },
  })
  t.deepEqual(specs, [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('specific files', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    e2e: {
      specPattern: 'cypress/e2e/featureA/user.cy*.ts',
      excludeSpecPattern: ['utils.js'],
    },
  })
  t.deepEqual(specs, ['cypress/e2e/featureA/user.cy.ts'])
})

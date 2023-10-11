const test = require('ava')
const { findCypressSpecs } = require('..')
const { toRelative } = require('../src/files')

test('string ignore pattern v9', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    integrationFolder: 'cypress/e2e',
    testFiles2: '**/*.js',
    ignoreTestFiles: 'utils.js',
    version: '9.7.0',
  })
  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('array string ignore pattern v10', (t) => {
  t.plan(1)

  const specs = findCypressSpecs({
    version: '10.0.0',
    e2e: {
      specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
      excludeSpecPattern: ['utils.js'],
    },
  })

  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('string ignore pattern v10', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    version: '10.0.0',
    e2e: {
      specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
      excludeSpecPattern: 'utils.js',
    },
  })
  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('specific files', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    version: '10.0.0',
    e2e: {
      specPattern: 'cypress/e2e/featureA/user.cy*.ts',
      excludeSpecPattern: ['utils.js'],
    },
  })

  t.deepEqual(specs, ['cypress/e2e/featureA/user.cy.ts'])
})

test('list of specific files', (t) => {
  t.plan(1)
  const specs = findCypressSpecs({
    version: '10.0.0',
    e2e: {
      specPattern: [
        'cypress/e2e/featureA/user.cy*.ts',
        'cypress/e2e/spec-b.cy.js',
      ],
      excludeSpecPattern: ['utils.js'],
    },
  })
  t.deepEqual(specs, [
    'cypress/e2e/featureA/user.cy.ts',
    'cypress/e2e/spec-b.cy.js',
  ])
})

test('returns absolute filenames', (t) => {
  t.plan(1)
  const specs = toRelative(
    findCypressSpecs(
      {
        version: '10.0.0',
        e2e: {
          specPattern: [
            'cypress/e2e/featureA/user.cy*.ts',
            'cypress/e2e/spec-b.cy.js',
          ],
          excludeSpecPattern: ['utils.js'],
        },
      },
      'e2e',
      true,
    ),
  )
  t.deepEqual(specs, [
    'cypress/e2e/featureA/user.cy.ts',
    'cypress/e2e/spec-b.cy.js',
  ])
})

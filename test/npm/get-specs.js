const test = require('ava')
const { getSpecs } = require('../..')
const { toRelative } = require('../../src/files')
const sinon = require('sinon')
const path = require('path')

test('finds the specs', async (t) => {
  t.plan(1)
  const specs = await getSpecs()
  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('finds the specs with custom spec pattern', async (t) => {
  t.plan(1)
  const specs = await getSpecs({
    e2e: {
      specPattern: '*/e2e/featureA/*.cy.ts',
    },
  })
  t.deepEqual(specs, ['cypress/e2e/featureA/user.cy.ts'])
})

test('returns an empty list for unknown spec type', async (t) => {
  t.plan(1)
  const specs = await getSpecs({}, 'api')
  t.deepEqual(specs, [])
})

test('returns a list of component specs', async (t) => {
  t.plan(1)
  const specs = await getSpecs(undefined, 'component')
  t.deepEqual(specs, [
    'test-components/comp1.cy.js',
    'test-components/comp2.cy.ts',
  ])
})

test('finds the specs passing resolved config (e2e)', async (t) => {
  // imagine we are getting the config in the "e2e setupNodeEvents"
  const config = {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: '*.hot-update.js',
    testingType: 'e2e',
  }
  t.plan(1)
  const specs = await getSpecs(config)
  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test('finds the specs passing resolved config (component)', async (t) => {
  // imagine we are getting the config in the "component setupNodeEvents"
  const config = {
    specPattern: 'test-components/*.cy.{js,jsx,ts,tsx}',
    testingType: 'component',
  }
  t.plan(1)
  const specs = await getSpecs(config)
  t.deepEqual(specs, [
    'test-components/comp1.cy.js',
    'test-components/comp2.cy.ts',
  ])
})

test('supports list of specs in specPattern', async (t) => {
  const specPattern = [
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ]
  const config = {
    specPattern,
    testingType: 'e2e',
  }
  t.plan(1)
  const specs = await getSpecs(config)
  t.deepEqual(specs, specPattern)
})

test('supports wildcards in the list of specs', async (t) => {
  const specPattern = [
    'cypress/e2e/spec*.cy.js',
    'cypress/e2e/featureA/user*.cy.ts',
  ]
  const config = {
    specPattern,
    testingType: 'e2e',
  }
  t.plan(1)
  const specs = await getSpecs(config)
  t.deepEqual(specs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test.serial('returns absolute filenames', async (t) => {
  const specPattern = [
    'cypress/e2e/spec*.cy.js',
    'cypress/e2e/featureA/user*.cy.ts',
  ]
  const config = {
    specPattern,
    testingType: 'e2e',
  }
  t.plan(2)
  const specs = await getSpecs(config, 'e2e', true)
  const cwd = process.cwd()
  t.truthy(specs.every((filename) => filename.startsWith(cwd)))

  const relativeSpecs = toRelative(specs)
  t.deepEqual(relativeSpecs, [
    'cypress/e2e/spec-b.cy.js',
    'cypress/e2e/spec.cy.js',
    'cypress/e2e/featureA/user.cy.ts',
  ])
})

test.serial('uses project root', async (t) => {
  const projectRoot = process.cwd()
  console.log('project root', projectRoot)
  const stub = sinon
    .stub(process, 'cwd')
    .returns(path.join(projectRoot, 'mocks/my-app'))

  const config = {
    projectRoot,
    e2e: {
      specPattern: 'mocks/my-app/e2e/e2e-tests/*.cy.js',
    },
  }
  t.plan(1)
  const specs = await getSpecs(config)
  t.deepEqual(specs, ['mocks/my-app/e2e/e2e-tests/spec-a.cy.js'])
  stub.restore()
})

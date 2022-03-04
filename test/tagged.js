const test = require('ava')
const input = require('./tagged.json')
const { pickTaggedTests, pickTaggedTestsFrom } = require('../src/tagged')

test('filters a single array of tests', (t) => {
  const tests = [
    {
      name: 'works',
      type: 'test',
      tags: ['@user'],
    },
    {
      name: 'needs to be written',
      type: 'test',
      tags: ['@alpha'],
      pending: true,
    },
  ]
  pickTaggedTests(tests, '@user')
  t.deepEqual(tests, [
    {
      name: 'works',
      type: 'test',
      tags: ['@user'],
    },
  ])
})

test('filters tests tagged @alpha', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@alpha')
  // all tests but one were eliminated
  const expected = {
    'cypress/e2e/featureA/user.js': [
      {
        name: 'needs to be written',
        type: 'test',
        tags: ['@alpha'],
        pending: true,
      },
    ],
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('filters deep tests tagged @user', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@user')
  const expected = {
    'cypress/e2e/spec.js': [
      {
        name: 'parent suite',
        type: 'suite',
        tags: ['@main'],
        suites: [
          {
            name: 'inner suite',
            type: 'suite',
            tests: [
              {
                name: 'shows something!',
                type: 'test',
                tags: ['@user'],
              },
            ],
          },
        ],
        tests: [],
      },
    ],
    'cypress/e2e/featureA/user.js': [
      { name: 'works', type: 'test', tags: ['@user'] },
    ],
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('applies tag from the suite to the tests', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@main')
  const expected = {
    'cypress/e2e/spec.js': [
      {
        name: 'parent suite',
        type: 'suite',
        tags: ['@main'],
        suites: [
          {
            name: 'inner suite',
            type: 'suite',
            tests: [
              {
                name: 'shows something!',
                type: 'test',
                tags: ['@user'],
              },
            ],
          },
        ],
        tests: [{ name: 'works well enough', type: 'test' }],
      },
    ],
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

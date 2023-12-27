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

test('filters a single array of tests using multiple tags', (t) => {
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
  const copy = JSON.parse(JSON.stringify(tests))
  pickTaggedTests(tests, ['@user', '@alpha'])
  // all tests were picked by one or the other tag
  t.deepEqual(tests, copy)
})

test('filters a single array of tests using some tags', (t) => {
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
  const copy = JSON.parse(JSON.stringify(tests))
  pickTaggedTests(tests, ['@not-found', '@alpha'])
  t.deepEqual(tests, [
    {
      name: 'needs to be written',
      type: 'test',
      tags: ['@alpha'],
      pending: true,
    },
  ])
})

test('filters tests tagged @alpha', (t) => {
  t.plan(2)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@alpha')
  // modifies the object in place
  t.true(result === json)

  // all tests but one were eliminated
  const expected = {
    'cypress/e2e/featureA/user.js': {
      counts: { tests: 1, pending: 1 },
      tests: [
        {
          name: 'needs to be written',
          type: 'test',
          tags: ['@alpha'],
          pending: true,
        },
      ],
    },
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('filters deep tests tagged @user', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@user')
  const expected = {
    'cypress/e2e/spec.js': {
      counts: { tests: 1, pending: 0 },
      tests: [
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
    },
    'cypress/e2e/featureA/user.js': {
      counts: { tests: 1, pending: 0 },
      tests: [{ name: 'works', type: 'test', tags: ['@user'] }],
    },
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('applies tag from the suite to the tests', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, '@main')
  const expected = {
    'cypress/e2e/spec.js': {
      counts: { tests: 2, pending: 0 },
      tests: [
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
    },
  }
  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('applies multiple tags', (t) => {
  t.plan(1)
  const json = JSON.parse(JSON.stringify(input))
  const result = pickTaggedTestsFrom(json, ['@main', '@user'])
  const expected = {
    'cypress/e2e/spec.js': {
      counts: {
        tests: 2,
        pending: 0,
      },
      tests: [
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
          tests: [
            {
              name: 'works well enough',
              type: 'test',
            },
          ],
        },
      ],
    },
    'cypress/e2e/featureA/user.js': {
      counts: {
        tests: 1,
        pending: 0,
      },
      tests: [
        {
          name: 'works',
          type: 'test',
          tags: ['@user'],
        },
      ],
    },
  }

  // console.dir(result, { depth: null })
  t.deepEqual(result, expected)
})

test('includes tests required by the parent required tag', (t) => {
  const json = {
    'cypress/integration/spec1.js': {
      counts: {
        tests: 2,
        pending: 0,
      },
      tests: [
        {
          name: 'works',
          type: 'test',
          tags: ['user'],
          requiredTags: ['@foo'],
        },
        {
          name: 'does not work',
          type: 'test',
          requiredTags: ['@foo', '@bar'],
        },
      ],
    },
    'cypress/integration/spec2.js': {
      counts: {
        tests: 1,
        pending: 0,
      },
      tests: [
        {
          name: 'spec 2 works',
          type: 'test',
          tags: ['user'],
          requiredTags: ['@foo'],
        },
      ],
    },
    'cypress/integration/spec3.js': {
      counts: {
        tests: 2,
        pending: 0,
      },
      tests: [
        {
          name: 'parent1',
          type: 'suite',
          requiredTags: ['@parent1'],
          tests: [
            {
              name: 'child1',
              type: 'test',
            },
          ],
        },
        {
          name: 'parent2',
          type: 'suite',
          tags: ['@parent2'],
          tests: [
            {
              name: 'child2',
              type: 'test',
            },
          ],
        },
      ],
    },
  }
  const picked = pickTaggedTestsFrom(json, '@parent1')
  // console.log(JSON.stringify(picked, null, 2))
  // only spec 3 has a test whose parent has the required tag "@parent1"
  t.deepEqual(picked, {
    'cypress/integration/spec3.js': {
      counts: {
        tests: 1,
        pending: 0,
      },
      tests: [
        {
          name: 'parent1',
          type: 'suite',
          requiredTags: ['@parent1'],
          tests: [
            {
              name: 'child1',
              type: 'test',
            },
          ],
        },
      ],
    },
  })
})

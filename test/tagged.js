const test = require('ava')
const input = require('./tagged.json')

// note: modifies the tests in place
function pickTaggedTests(tests, tag) {
  if (!Array.isArray(tests)) {
    return
  }
  const filteredTests = tests.filter(
    (test) => test.tags && test.tags.includes(tag),
  )
  tests.length = 0
  tests.push(...filteredTests)
}

function pickTaggedTestsFrom(json, tag) {
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename]
    pickTaggedTests(fileTests, tag)
  })

  return removeEmptyNodes(json)
}

function removeEmptyNodes(json) {
  Object.keys(json).forEach((filename) => {
    const fileTests = json[filename]
    if (!fileTests.length) {
      delete json[filename]
    }
  })
  return json
}

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

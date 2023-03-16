const test = require('ava')
const execa = require('execa-wrap')

test('prints changed spec files that have the given tag', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  // find all changed specs against the given branch
  // but only the specs that have the tests with tag "@alpha"
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/branch-tagged-1.js',
      './bin/find',
      '--branch',
      'tagged-1',
      '--tagged',
      '@alpha',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  // only a single spec should be printed for the given tag
  // console.log(result)
  t.snapshot(result)
})

test('prints number of changed spec files that have the given tag', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  // find all changed specs against the given branch
  // but only the specs that have the tests with tag "@alpha"
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/branch-tagged-1.js',
      './bin/find',
      '--branch',
      'tagged-1',
      '--tagged',
      '@alpha',
      '--count',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  // only a single spec count 1 should be printed for the given tag
  // console.log(result)
  t.snapshot(result)
})

test.only('no changed specs tagged with the tag', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  // find all changed specs against the given branch
  // but only the specs that have the tests with tag "@alpha"
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/branch-tagged-1-no-alpha.js',
      './bin/find',
      '--branch',
      'tagged-1',
      '--tagged',
      '@alpha',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  // only a single spec should be printed for the given tag
  console.log(result)
  // t.snapshot(result)
})

const test = require('ava')
const execa = require('execa-wrap')

test('prints changed spec files against another branch', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  const result = await execa(
    'node',
    ['-r', './mocks/branch-1.js', './bin/find', '--branch', 'branch-test-1'],
    {
      filter: ['code', 'stdout'],
    },
  )
  t.snapshot(result)
})

test('prints changed spec files against the parent commit', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/parent-1.js',
      './bin/find',
      '--branch',
      'parent-1',
      '--parent',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  t.snapshot(result)
})

const test = require('ava')
const execa = require('execa-wrap')

test('prints changes spec files against another branch', async (t) => {
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

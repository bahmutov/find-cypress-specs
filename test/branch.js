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

test('prints count of changed spec files against the parent commit', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/parent-2.js',
      './bin/find',
      '--branch',
      'parent-2',
      '--parent',
      '--count',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  t.snapshot(result)
})

test('changed spec files that change because an imported file changed', async (t) => {
  t.plan(1)
  // note: all paths are with respect to the repo's root folder
  const result = await execa(
    'node',
    [
      '-r',
      './mocks/changed-imported-file.js',
      './bin/find',
      '--branch',
      'parent-3',
      '--parent',
      '--trace-imports',
      'cypress',
    ],
    {
      filter: ['code', 'stdout'],
    },
  )
  // the mock returns utils.js file changed
  // but by tracing the specs that import it
  // we should determine that the "spec.cy.js"
  // imports it and thus should be considered changed too
  t.snapshot(result)
})

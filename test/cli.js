const test = require('ava')
const execa = require('execa-wrap')

test('prints tags', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tags'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test names', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test tagged @alpha', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--tagged', '@alpha'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints test tagged @user', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--tagged', '@user'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints test tagged @main', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--tagged', '@main'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints test tagged @main and @alpha', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--tagged', '@main,@alpha'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints only the skipped tests', async (t) => {
  // prints only the tests that have "it.skip"
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names', '--skipped'], {
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('prints only the skipped test count', async (t) => {
  // counts only the tests that have "it.skip"
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--skipped', '--count'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('--pending is an alias to --skipped', async (t) => {
  // prints only the tests that have "it.skip"
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names', '--pending'], {
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('jsx components', async (t) => {
  t.plan(1)
  const result = await execa('npm', ['run', '--silent', 'demo-component'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('exclusive tests', async (t) => {
  t.plan(1)
  const result = await execa('npm', ['run', '--silent', 'demo-exclusive'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test file names --tagged @alpha', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tagged', '@alpha'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test file names --tagged @alpha,@main,@user', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tagged', '@alpha'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test file names --tagged empty string', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tagged', ''], {
    filter: ['code', 'stdout'],
  })
  // there should be no specs tagged an empty string ""
  // console.log(result)
  t.snapshot(result)
})

test('prints the count of specs', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--count'], {
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('prints the count of test files --tagged @alpha with --count', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--tagged', '@alpha', '--count'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints the number of E2E and component tests', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--test-counts'], {
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('prints tags and required tags', async (t) => {
  t.plan(1)
  const result = await execa('node', ['../bin/find', '--names'], {
    cwd: './test-required-tags',
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('filters by required tag', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['../bin/find', '--names', '--tagged', '@bar'],
    {
      cwd: './test-required-tags',
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('counts by required tag', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['../bin/find', '--count', '--tagged', '@bar'],
    {
      cwd: './test-required-tags',
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('counts all tags including required', async (t) => {
  t.plan(1)
  const result = await execa('node', ['../bin/find', '--count', '--tags'], {
    cwd: './test-required-tags',
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.snapshot(result)
})

test('skips specs in the node_modules automatically', async (t) => {
  t.plan(2)
  const result = await execa('node', ['../bin/find'], {
    cwd: './test-skip-node-modules',
    filter: ['code', 'stdout'],
  })
  // console.log(result)
  t.false(result.includes('node_modules'))
  t.snapshot(result)
})

test('finds tests with BOTH tags using AND syntax', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['../bin/find', '--names', '--tagged', '@foo+@bar'],
    {
      cwd: './test-required-tags',
      filter: ['code', 'stdout'],
    },
  )
  // should find ONLY the test tagged with both @foo and @bar
  // console.log(result)
  t.snapshot(result)
})

test('applies AND syntax to the effective tags', async (t) => {
  t.plan(3)
  const result = await execa(
    'node',
    ['../bin/find', '--names', '--tagged', '@user+@sanity'],
    {
      cwd: './test-effective-tags',
      filter: ['code', 'stdout'],
    },
  )
  // should find ONLY the test tagged with both @foo and @bar
  console.log(result)
  t.true(
    result.includes('cypress/integration/spec2.js'),
    'finds the second spec',
  )
  t.true(
    result.includes('cypress/integration/spec1.js'),
    'finds the first spec',
  )
  t.snapshot(result)
})

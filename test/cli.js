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

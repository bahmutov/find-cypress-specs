const test = require('ava')
const execa = require('execa-wrap')

test('prints test names in json', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names', '--json'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test names in json using -j', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names', '-j'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints tags in json', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tags', '--json'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints tags in json using -j', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tags', '-j'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints tests tagged with @user in json', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--json', '--tagged', '@user'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

test('prints tests tagged with @alpha in json', async (t) => {
  t.plan(1)
  const result = await execa(
    'node',
    ['./bin/find', '--names', '--json', '--tagged', '@alpha'],
    {
      filter: ['code', 'stdout'],
    },
  )
  // console.log(result)
  t.snapshot(result)
})

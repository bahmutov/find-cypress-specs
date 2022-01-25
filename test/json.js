const test = require('ava')
const execa = require('execa-wrap')

test('prints test names in json', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names', '--json'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

const test = require('ava')
const execa = require('execa-wrap')

test('tags', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tags'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

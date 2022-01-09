#!/usr/bin/env node

const arg = require('arg')
const { getSpecs } = require('../src')
const fs = require('fs')
const { getTestNames, formatTestList } = require('find-test-names')

const args = arg({
  '--names': Boolean,

  // aliases
  '-n': '--names',
})

const specs = getSpecs()
if (args['--names']) {
  specs.forEach((filename) => {
    const source = fs.readFileSync(filename, 'utf8')
    const result = getTestNames(source, true)
    console.dir(result.structure, { depth: null })
    console.log(filename)
    console.log(formatTestList(result.structure))
    console.log('')
  })
} else {
  console.log(specs.join(','))
}

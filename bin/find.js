#!/usr/bin/env node

const arg = require('arg')
const { getSpecs } = require('../src')
const fs = require('fs')
const pluralize = require('pluralize')
const { getTestNames, formatTestList } = require('find-test-names')

const args = arg({
  '--names': Boolean,

  // aliases
  '-n': '--names',
})

const specs = getSpecs()
if (args['--names']) {
  if (!specs.length) {
    console.log('no specs found')
  } else {
    console.log('')
    specs.forEach((filename) => {
      const source = fs.readFileSync(filename, 'utf8')
      const result = getTestNames(source, true)
      // enable if need to debug the parsed test
      // console.dir(result.structure, { depth: null })

      const testCount = pluralize('test', result.testNames.length, true)

      console.log('%s (%s)', filename, testCount)
      console.log(formatTestList(result.structure))
      console.log('')
    })
  }
} else {
  console.log(specs.join(','))
}

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
    let testsN = 0
    let pendingTestsN = 0
    specs.forEach((filename) => {
      const source = fs.readFileSync(filename, 'utf8')
      const result = getTestNames(source, true)
      // enable if need to debug the parsed test
      // console.dir(result.structure, { depth: null })

      testsN += result.testCount
      const testCount = pluralize('test', result.testNames.length, true)
      pendingTestsN += result.pendingTestCount

      if (result.pendingTestCount) {
        console.log(
          '%s (%s, %d pending)',
          filename,
          testCount,
          result.pendingTestCount,
        )
      } else {
        console.log('%s (%s)', filename, testCount)
      }
      console.log(formatTestList(result.structure))
      console.log('')
    })

    if (pendingTestsN) {
      console.log(
        'found %s (%s, %d pending)',
        pluralize('spec', specs.length, true),
        pluralize('test', testsN, true),
        pendingTestsN,
      )
    } else {
      console.log(
        'found %s (%s)',
        pluralize('spec', specs.length, true),
        pluralize('test', testsN, true),
      )
    }
    console.log('')
  }
} else {
  console.log(specs.join(','))
}

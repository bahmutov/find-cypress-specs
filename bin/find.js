#!/usr/bin/env node

const arg = require('arg')
const { getSpecs, collectResults, findChangedFiles } = require('../src')
const { pickTaggedTestsFrom, leavePendingTestsOnly } = require('../src/tagged')
const { addCounts } = require('../src/count')
const { stringAllInfo } = require('../src/print')

const fs = require('fs')
const path = require('path')
const { getTestNames, countTags } = require('find-test-names')
const consoleTable = require('console.table')
const debug = require('debug')('find-cypress-specs')
const { getDependsInFolder } = require('spec-change')

const args = arg({
  '--names': Boolean,
  '--tags': Boolean,
  // output in JSON format
  '--json': Boolean,
  // find the specs that have changed against this Git branch
  '--branch': String,
  // find the specs that have changed against the parent of the branch
  '--parent': Boolean,
  '--count': Boolean,
  // filter all tests to those that have the given tag
  '--tagged': String,
  // print only the "it.only" tests
  '--skipped': Boolean,
  // when finding specs changed against a given parent of the branch
  // also look at the import and require statements to trace dependencies
  // and consider specs that import a changes source file changed to
  // The value of this argument is the subfolder with Cypress tests, like "cypress"
  '--trace-imports': String,

  // aliases
  '-n': '--names',
  '--name': '--names',
  '-t': '--tags',
  '--tag': '--tags',
  '-j': '--json',
  '-b': '--branch',
  '--deps': '--trace-imports',
  // Cypress test status (just like Mocha)
  // calls "it.skip" pending tests
  // https://glebbahmutov.com/blog/cypress-test-statuses/
  '--pending': '--skipped',
})

debug('arguments %o', args)

const specs = getSpecs()
if (args['--names'] || args['--tags']) {
  if (!specs.length) {
    console.log('no specs found')
  } else {
    console.log('')
    // counts the number of tests for each tag across all specs
    const tagTestCounts = {}
    const jsonResults = {}

    specs.forEach((filename) => {
      jsonResults[filename] = {
        counts: {
          tests: 0,
          pending: 0,
        },
        tests: [],
      }
      const source = fs.readFileSync(filename, 'utf8')
      const result = getTestNames(source, true)
      // enable if need to debug the parsed test
      // console.dir(result.structure, { depth: null })
      collectResults(result.structure, jsonResults[filename].tests)

      if (args['--tags']) {
        const specTagCounts = countTags(result.structure)
        Object.keys(specTagCounts).forEach((tag) => {
          if (!(tag in tagTestCounts)) {
            tagTestCounts[tag] = specTagCounts[tag]
          } else {
            tagTestCounts[tag] += specTagCounts[tag]
          }
        })
      }
    })

    addCounts(jsonResults)

    if (args['--names']) {
      if (args['--tagged']) {
        // filter all collected tests to those that have the given tag(s)
        const splitTags = args['--tagged']
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        debug('filtering all tests by tag "%o"', splitTags)
        pickTaggedTestsFrom(jsonResults, splitTags)
        // recompute the number of tests
        addCounts(jsonResults)
      } else if (args['--skipped']) {
        debug('leaving only skipped (pending) tests')
        leavePendingTestsOnly(jsonResults)
        // recompute the number of tests
        addCounts(jsonResults)
      }

      if (args['--json']) {
        console.log(JSON.stringify(jsonResults, null, 2))
      } else {
        const str = stringAllInfo(jsonResults)
        console.log(str)
      }
      console.log('')
    }

    if (args['--tags']) {
      const tagEntries = Object.entries(tagTestCounts)
      const sortedTagEntries = tagEntries.sort((a, b) => {
        // every entry is [tag, count], so compare the tags
        return a[0].localeCompare(b[0])
      })
      if (args['--json']) {
        // assemble a json object with the tag counts
        const tagResults = Object.fromEntries(sortedTagEntries)
        console.log(JSON.stringify(tagResults, null, 2))
      } else {
        const table = consoleTable.getTable(['Tag', 'Tests'], sortedTagEntries)
        console.log(table)
      }
    }
  }
} else if (args['--branch']) {
  debug('determining specs changed against branch %s', args['--branch'])
  let changedFiles = findChangedFiles(args['--branch'], args['--parent'])
  debug('changed files %o', changedFiles)
  debug('comparing against the specs %o', specs)
  if (args['--trace-imports']) {
    debug('tracing dependent changes in folder %s', args['--trace-imports'])
    const absoluteFolder = path.resolve(args['--trace-imports'])
    const deps = getDependsInFolder(absoluteFolder)
    debug('traced dependencies via imports and require')
    debug(deps)
    Object.entries(deps).forEach(([filename, fileDependents]) => {
      const f = path.join(args['--trace-imports'], filename)
      if (changedFiles.includes(f)) {
        console.log(filename, '->', fileDependents.join(','))
      }
    })
  }
  let changedSpecs = specs.filter((file) => changedFiles.includes(file))
  debug('changed specs %o', changedSpecs)

  if (args['--tagged']) {
    const splitTags = args['--tagged']
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    debug('filtering changed specs by tags %o', splitTags)
    changedSpecs = changedSpecs.filter((file) => {
      const source = fs.readFileSync(file, 'utf8')
      const result = getTestNames(source, true)
      const specTagCounts = countTags(result.structure)
      const specHasTags = Object.keys(specTagCounts).some((tag) =>
        splitTags.includes(tag),
      )
      debug('spec %s has tags? %o', file, specHasTags)

      return specHasTags
    })
  }

  if (args['--count']) {
    console.log(changedSpecs.length)
  } else {
    console.log(changedSpecs.join(','))
  }
} else {
  console.log(specs.join(','))
}

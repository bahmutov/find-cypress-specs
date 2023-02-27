#!/usr/bin/env node

const arg = require('arg')
const { getSpecs, findChangedFiles, getTests } = require('../src')
const { stringAllInfo } = require('../src/print')

const fs = require('fs')
const path = require('path')
const { getTestNames, countTags } = require('find-test-names')
const consoleTable = require('console.table')
const debug = require('debug')('find-cypress-specs')
const { getDependsInFolder } = require('spec-change')
const core = require('@actions/core')

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
  // when enabled, this code uses GitHub Actions Core package
  // to set two named outputs, one for number of changed specs
  // another for actual list of files
  '--set-gha-outputs': Boolean,
  // save a JSON file with traced dependencies to save time
  '--cache-trace': Boolean,
  '--time-trace': Boolean,
  // do not add more than this number of extra specs after tracing
  '--max-added-traced-specs': Number,
  // find component specs
  '--component': Boolean,
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
const specType = args['--component'] ? 'component' : 'e2e'

const specs = getSpecs(undefined, specType)

if (args['--names'] || args['--tags']) {
  // counts the number of tests for each tag across all specs
  const { jsonResults, tagTestCounts } = getTests(specs, {
    tags: args['--tags'],
    tagged: args['--tagged'],
    skipped: args['--skipped'],
  })

  if (args['--names']) {
    if (args['--count']) {
      let n = 0
      Object.keys(jsonResults).forEach((filename) => {
        const skippedCount = jsonResults[filename].counts.pending
        n += skippedCount
      })
      console.log(n)
    } else {
      if (args['--json']) {
        console.log(JSON.stringify(jsonResults, null, 2))
      } else {
        const str = stringAllInfo(jsonResults)
        console.log(str)
      }
      console.log('')
    }
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
} else if (args['--branch']) {
  debug('determining specs changed against branch %s', args['--branch'])
  let changedFiles = findChangedFiles(args['--branch'], args['--parent'])
  debug('changed files %o', changedFiles)
  debug('comparing against the specs %o', specs)
  if (args['--trace-imports']) {
    debug('tracing dependent changes in folder %s', args['--trace-imports'])

    const saveDependenciesFile = 'deps.json'
    let deps
    if (args['--cache-trace']) {
      if (fs.existsSync(saveDependenciesFile)) {
        debug(
          'loading cached traced dependencies from file %s',
          saveDependenciesFile,
        )
        deps = JSON.parse(fs.readFileSync(saveDependenciesFile, 'utf-8')).deps
      }
    }

    if (!deps) {
      const absoluteFolder = path.join(process.cwd(), args['--trace-imports'])
      const depsOptions = { folder: absoluteFolder, time: args['--time-trace'] }
      if (args['--cache-trace']) {
        depsOptions.saveDepsFilename = saveDependenciesFile
        debug(
          'will save found dependencies into the file %s',
          saveDependenciesFile,
        )
      }
      debug('tracing options %o', depsOptions)
      deps = getDependsInFolder(depsOptions)
    }
    debug('traced dependencies via imports and require')
    debug(deps)

    // add a sensible limit to the number of extra specs to add
    // when we trace the dependencies in the changed source files
    const addedTracedFiles = []
    const maxAddTracedFiles = args['--max-added-traced-specs'] || 1000
    debug('maximum traced files to add %d', maxAddTracedFiles)

    Object.entries(deps).forEach(([filename, fileDependents]) => {
      const f = path.join(args['--trace-imports'], filename)
      if (changedFiles.includes(f)) {
        debug(
          'the source file %s has changed, including its dependents %o in the list of changed files',
          f,
          fileDependents,
        )
        fileDependents.forEach((name) => {
          const nameInCypressFolder = path.join(args['--trace-imports'], name)
          if (!changedFiles.includes(nameInCypressFolder)) {
            if (addedTracedFiles.length < maxAddTracedFiles) {
              changedFiles.push(nameInCypressFolder)
              addedTracedFiles.push(nameInCypressFolder)
            }
          }
        })
      }
    })
    debug('added %d traced specs %o', addedTracedFiles.length, addedTracedFiles)
  }

  let changedSpecs = specs.filter((file) => changedFiles.includes(file))
  debug('changed %d specs %o', changedSpecs.length, changedSpecs)
  if (args['--set-gha-outputs']) {
    debug('setting GitHub Actions outputs changedSpecsN and changedSpecs')
    core.setOutput('changedSpecsN', changedSpecs.length)
    core.setOutput('changedSpecs', changedSpecs.join(','))
  }

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

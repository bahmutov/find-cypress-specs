#!/usr/bin/env node

const arg = require('arg')
const { getSpecs, findChangedFiles, getTests } = require('../src')
const { getTestCounts } = require('../src/tests-counts')
const { stringAllInfo, stringMarkdownTests } = require('../src/print')
const { updateBadge } = require('../src/badge')

const fs = require('fs')
const path = require('path')
const { getTestNames, countTags } = require('find-test-names')
const consoleTable = require('console.table')
const debug = require('debug')('find-cypress-specs')
const { getDependsInFolder } = require('spec-change')
const core = require('@actions/core')
const pluralize = require('pluralize')

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
  // print a summary to the GitHub Actions job summary
  '--gha-summary': Boolean,
  // save a JSON file with traced dependencies to save time
  '--cache-trace': Boolean,
  '--time-trace': Boolean,
  // do not add more than this number of extra specs after tracing
  '--max-added-traced-specs': Number,
  // find component specs
  '--component': Boolean,
  // count total number of E2E and component tests
  '--test-counts': Boolean,
  // if we count the tests, we can update the README badge
  '--update-badge': Boolean,
  // output the list in Markdown format
  '--markdown': Boolean,
  // optional: output the number of machines needed to run the tests
  '--specs-per-machine': Number,
  '--max-machines': Number,
  //
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
  '--tc': '--test-counts',
  '--md': '--markdown',
})

debug('arguments %o', args)

if (args['--test-counts']) {
  debug('finding test counts')
  const { nE2E, nComponent } = getTestCounts()
  console.log(
    '%d e2e %s, %d component %s',
    nE2E,
    pluralize('test', nE2E),
    nComponent,
    pluralize('test', nComponent),
  )
  if (args['--update-badge']) {
    debug('updating the README test count badge')
    updateBadge({ nE2E, nComponent })
  }
} else {
  const specType = args['--component'] ? 'component' : 'e2e'

  const specs = getSpecs(undefined, specType)

  // if the user passes "--tagged ''" we want to find the specs
  // but then filter them all out
  const isTaggedPresent = args['--tagged'] || args['--tagged'] === ''

  if (args['--branch']) {
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
        const depsOptions = {
          folder: absoluteFolder,
          time: Boolean(args['--time-trace']),
        }
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
      debug(
        'added %d traced specs %o',
        addedTracedFiles.length,
        addedTracedFiles,
      )
    }

    let changedSpecs = specs.filter((file) => changedFiles.includes(file))
    debug('changed %d specs %o', changedSpecs.length, changedSpecs)

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
        // debug(specTagCounts)
        const specHasTags = Object.keys(specTagCounts).some((tag) =>
          splitTags.includes(tag),
        )
        debug('spec %s has any of the tags? %o', file, specHasTags)
        return specHasTags
      })
    }

    let machinesNeeded
    if (args['--specs-per-machine'] > 0 && args['--max-machines'] > 0) {
      const specsPerMachine = args['--specs-per-machine']
      const maxMachines = args['--max-machines']
      machinesNeeded = Math.min(
        Math.ceil(changedSpecs.length / specsPerMachine),
        maxMachines,
      )
      debug(
        'specs per machine %d with max %d machines',
        specsPerMachine,
        maxMachines,
      )
      debug(
        'from %d specs, set %d output machinesNeeded',
        changedSpecs.length,
        machinesNeeded,
      )
    }

    if (args['--set-gha-outputs']) {
      debug('setting GitHub Actions outputs changedSpecsN and changedSpecs')
      debug('changedSpecsN %d', changedSpecs.length)
      debug('plus changedSpecs')
      core.setOutput('changedSpecsN', changedSpecs.length)
      core.setOutput('changedSpecs', changedSpecs.join(','))
      core.setOutput('machinesNeeded', machinesNeeded)
    }

    if (args['--gha-summary']) {
      debug('writing GitHub Actions summary')
      let summary

      if (changedSpecs.length > 0) {
        summary = `Found that ${pluralize(
          'spec',
          changedSpecs.length,
          true,
        )} changed: ${changedSpecs.join(', ')}`
        if (machinesNeeded > 0) {
          summary += `\nestimated ${pluralize(
            'machine',
            machinesNeeded,
            true,
          )} needed`
        }
      } else {
        summary = 'No specs changed'
      }
      if (process.env.GITHUB_STEP_SUMMARY) {
        core.summary.addRaw(summary).write()
      } else {
        console.log('GitHub summary')
        console.log(summary)
      }
    }

    if (args['--count']) {
      console.log(changedSpecs.length)
    } else {
      console.log(changedSpecs.join(','))
    }
  } else if (args['--names'] || args['--tags'] || isTaggedPresent) {
    // counts the number of tests for each tag across all specs
    debug('count number of tests')
    const { jsonResults, tagTestCounts } = getTests(specs, {
      tags: args['--tags'],
      tagged: args['--tagged'],
      skipped: args['--skipped'],
    })
    debug('json results from getTests')
    debug(jsonResults)
    debug('tag test counts')
    debug(tagTestCounts)

    if (args['--names']) {
      debug('output test names')
      if (args['--count']) {
        debug('names and count')
        let n = 0
        Object.keys(jsonResults).forEach((filename) => {
          const skippedCount = jsonResults[filename].counts.pending
          n += skippedCount
        })
        console.log(n)
      } else {
        if (args['--json']) {
          debug('names in json format')
          console.log(JSON.stringify(jsonResults, null, 2))
        } else if (args['--markdown']) {
          debug('names in Markdown format')
          const str = stringMarkdownTests(jsonResults)
          console.log(str)
        } else {
          debug('names to standard out')
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

    if (!args['--names'] && !args['--tags']) {
      const specs = Object.keys(jsonResults)
      if (args['--count']) {
        debug('printing the number of specs %d', specs.length)
        console.log(specs.length)
      } else {
        debug('printing the spec names list only')
        const specNames = specs.join(',')
        console.log(specNames)

        if (args['--set-gha-outputs']) {
          debug('setting GitHub Actions outputs taggedSpecsN and taggedSpecs')
          debug('taggedSpecsN %d', specs.length)
          debug('plus taggedSpecs')
          core.setOutput('taggedSpecsN', specs.length)
          core.setOutput('taggedSpecs', specNames)
        }
      }
    }
  } else {
    if (args['--count']) {
      debug('printing the number of specs %d', specs.length)
      console.log(specs.length)
    } else {
      debug('printing just %d spec names', specs.length)
      console.log(specs.join(','))
    }
  }
}

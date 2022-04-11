const debug = require('debug')('find-cypress-specs')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const minimatch = require('minimatch')
const shell = require('shelljs')

const MINIMATCH_OPTIONS = { dot: true, matchBase: true }

/**
 * Reads the cypress config file and returns the relevant properties
 */
function getConfig(filename = 'cypress.json') {
  const s = fs.readFileSync(filename, 'utf8')
  const config = JSON.parse(s)
  const options = {
    integrationFolder: config.integrationFolder,
    testFiles: config.testFiles,
    ignoreTestFiles: config.ignoreTestFiles,
  }
  debug('got config options %o', options)
  return options
}

function findCypressSpecs(opts = {}) {
  const defaults = {
    integrationFolder: 'cypress/integration',
    testFiles: '**/*.{js,ts}',
    ignoreTestFiles: [],
  }
  const options = {
    integrationFolder: opts.integrationFolder || defaults.integrationFolder,
    testFiles: opts.testFiles || defaults.testFiles,
    ignoreTestFiles: opts.ignoreTestFiles || defaults.ignoreTestFiles,
  }
  debug('options %o', options)

  const files = globby.sync(options.testFiles, {
    sort: true,
    cwd: options.integrationFolder,
    ignore: options.ignoreTestFiles,
  })
  debug('found %d file(s) %o', files.length, files)

  // go through the files again and eliminate files that match
  // the ignore patterns
  const ignorePatterns = [].concat(options.ignoreTestFiles)
  debug('ignore patterns %o', ignorePatterns)

  // a function which returns true if the file does NOT match
  // all of our ignored patterns
  const doesNotMatchAllIgnoredPatterns = (file) => {
    // using {dot: true} here so that folders with a '.' in them are matched
    // as regular characters without needing an '.' in the
    // using {matchBase: true} here so that patterns without a globstar **
    // match against the basename of the file
    return ignorePatterns.every((pattern) => {
      return !minimatch(file, pattern, MINIMATCH_OPTIONS)
    })
  }

  const filtered = files.filter(doesNotMatchAllIgnoredPatterns)
  debug('filtered %d specs', filtered.length)
  debug(filtered.join('\n'))

  // return spec files with the added integration folder prefix
  return filtered.map((file) => path.join(options.integrationFolder, file))
}

function getSpecs() {
  const options = getConfig()
  const specs = findCypressSpecs(options)
  return specs
}

function collectResults(structure, results) {
  structure.forEach((t) => {
    const info = {
      name: t.name,
      type: t.type,
      tags: t.tags,
    }
    if (t.pending) {
      info.pending = t.pending
    }
    results.push(info)
    if (t.type === 'suite') {
      if (t.suites && t.suites.length) {
        // skip empty nested suites
        info.suites = []
        collectResults(t.suites, info.suites)
      }

      if (t.tests && t.tests.length) {
        // skip empty nested tests
        info.tests = []
        collectResults(t.tests, info.tests)
      }
    }
  })
}

/**
 * Finds files changed or added in the current branch when compared to the "origin/branch".
 * Returns a list of filenames. If there are no files, returns an empty list.
 * @param {string} branch The branch to compare against.
 * @param {boolean} useParent Determine the changes only against the parent commit.
 */
function findChangedFiles(branch, useParent) {
  if (!branch) {
    throw new Error('branch is required')
  }

  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git')
    return []
  }

  // can we find updated and added files?
  debug('finding changed files against %s', branch)
  debug('using parent?', useParent)

  if (useParent) {
    let result = shell.exec(`git merge-base origin/${branch} HEAD`, {
      silent: true,
    })
    if (result.code !== 0) {
      debug('git failed to find merge base with the branch %s', branch)
      return []
    }

    const commit = result.stdout.trim()
    debug('merge commit with branch "%s" is %s', branch, commit)
    result = shell.exec(`git diff --name-only --diff-filter=AMR ${commit}..`, {
      silent: true,
    })
    if (result.code !== 0) {
      debug('git diff failed with code %d', result.code)
      return []
    }

    const filenames = result.stdout.split('\n').filter(Boolean)
    return filenames
  } else {
    const command = `git diff --name-only --diff-filter=AMR origin/${branch}`
    debug('command: %s', command)

    const result = shell.exec(command, { silent: true })
    if (result.code !== 0) {
      debug('git diff failed with code %d', result.code)
      return []
    }

    const filenames = result.stdout.split('\n').filter(Boolean)
    return filenames
  }
}

module.exports = {
  getSpecs,
  // individual utilities
  getConfig,
  findCypressSpecs,
  collectResults,
  findChangedFiles,
}

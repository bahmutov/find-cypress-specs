const { addCounts } = require('../src/count')
const { getTestNames, countTags } = require('find-test-names')
const { pickTaggedTestsFrom, leavePendingTestsOnly } = require('../src/tagged')

const debug = require('debug')('find-cypress-specs')
const debugGit = require('debug')('find-cypress-specs:git')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const minimatch = require('minimatch')
const shell = require('shelljs')
const pluralize = require('pluralize')
const requireEveryTime = require('require-and-forget')

// Require CJS loader to resolve:
// https://github.com/bahmutov/find-cypress-specs/issues/228
// https://github.com/bahmutov/find-cypress-specs/issues/222
// https://github.com/privatenumber/tsx
require('tsx/cjs')

const MINIMATCH_OPTIONS = { dot: true, matchBase: true }

/**
 * Reads the Cypress config JSON file (Cypress v9) and returns the relevant properties
 */
function getConfigJson(filename = 'cypress.json') {
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

function getConfigJs(filename) {
  const jsFile = path.join(process.cwd(), filename)
  debug('loading Cypress config from %s', jsFile)
  const definedConfig = requireEveryTime(jsFile)
  return definedConfig
}

function getConfigTs(filename) {
  const configFilename = path.join(process.cwd(), filename)
  debug('loading Cypress config from %s', configFilename)
  const definedConfig = requireEveryTime(configFilename)
  debug('loaded config %o', definedConfig)
  if (definedConfig && definedConfig.default) {
    // due to TS / ES6 module transpile we got the default export
    debug('returning default export as config from %s', filename)
    return definedConfig.default
  }

  return definedConfig
}

function getConfig() {
  if (typeof process.env.CYPRESS_CONFIG_FILE !== 'undefined') {
    const configFile = process.env.CYPRESS_CONFIG_FILE
    if (
      configFile.endsWith('.js') ||
      configFile.endsWith('.cjs') ||
      configFile.endsWith('.mjs')
    ) {
      debug(`found file ${configFile}`)
      return getConfigJs(`./${configFile}`)
    } else if (configFile.endsWith('.ts')) {
      debug(`found file ${configFile}`)
      return getConfigTs(`./${configFile}`)
    } else if (configFile.endsWith('.json')) {
      debug(`found file ${configFile}`)
      return getConfigJson(`./${configFile}`)
    }
    throw new Error(
      'Config file should be .ts, .js, cjs, mjs, or .json file even when using CYPRESS_CONFIG_FILE env var',
    )
  }

  if (fs.existsSync('./cypress.config.js')) {
    debug('found file cypress.config.js')
    return getConfigJs('./cypress.config.js')
  }
  if (fs.existsSync('./cypress.config.cjs')) {
    debug('found file cypress.config.cjs')
    return getConfigJs('./cypress.config.cjs')
  }
  if (fs.existsSync('./cypress.config.mjs')) {
    debug('found file cypress.config.mjs')
    return getConfigJs('./cypress.config.mjs')
  }

  if (fs.existsSync('./cypress.config.ts')) {
    debug('found file cypress.config.ts')
    return getConfigTs('./cypress.config.ts')
  }

  if (fs.existsSync('./cypress.json')) {
    debug('found file cypress.json')
    return getConfigJson('./cypress.json')
  }

  throw new Error('Config file should be .ts, .js, .cjs, mjs, or .json file')
}

function findCypressSpecsV9(opts = {}, returnAbsolute = false) {
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
    absolute: returnAbsolute,
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

function findCypressSpecsV10(opts = {}, type = 'e2e', returnAbsolute = false) {
  debug('findCypressSpecsV10')
  if (type !== 'e2e' && type !== 'component') {
    throw new Error(`Unknown spec type ${type}`)
  }
  // handle the interoperability loading of default export
  if (Object.keys(opts).length === 1 && Object.keys(opts)[0] === 'default') {
    opts = opts.default
  }

  if (!(type in opts)) {
    debug('options %o', opts)
    throw new Error(`Missing "${type}" object in the Cypress config object`)
  }
  const e2eDefaults = {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: [],
  }
  const componentDefaults = {
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['/snapshots/*', '/image_snapshots/*'],
  }
  // https://on.cypress.io/configuration
  const options = {}

  if (type === 'e2e') {
    options.specPattern = opts.e2e.specPattern || e2eDefaults.specPattern
    options.excludeSpecPattern =
      opts.e2e.excludeSpecPattern || e2eDefaults.excludeSpecPattern
  } else if (type === 'component') {
    options.specPattern =
      opts.component.specPattern || componentDefaults.specPattern
    options.excludeSpecPattern =
      opts.component.excludeSpecPattern || componentDefaults.excludeSpecPattern
  }

  debug('options v10 %o', options)

  const ignore = Array.isArray(options.excludeSpecPattern)
    ? options.excludeSpecPattern
    : options.excludeSpecPattern
    ? [options.excludeSpecPattern]
    : []

  debug('ignore patterns %o', ignore)
  const userIgnoresNodeModules = ignore.some((pattern) =>
    pattern.includes('node_modules'),
  )
  if (userIgnoresNodeModules) {
    debug('user ignored node_modules')
  } else {
    debug('user did not ignore node_modules, adding it')
    ignore.push('**/node_modules/**')
  }

  const globbyOptions = {
    sort: true,
    ignore,
    absolute: returnAbsolute,
  }
  if (opts.projectRoot) {
    globbyOptions.cwd = opts.projectRoot
  }
  debug('globby options %s %o', options.specPattern, globbyOptions)

  /** @type string[] */
  const files = globby.sync(options.specPattern, globbyOptions)
  debug('found %d file(s) %o', files.length, files)

  // go through the files again and eliminate files that match
  // the ignore patterns
  const ignorePatterns = [].concat(options.excludeSpecPattern)

  // when using component spec pattern, ignore all E2E specs
  if (type === 'component') {
    const e2eIgnorePattern = options.e2e?.specPattern || e2eDefaults.specPattern
    ignorePatterns.push(e2eIgnorePattern)
    ignorePatterns.push('node_modules/**')
  }

  debug('ignore patterns %o', ignorePatterns)

  // a function which returns true if the file does NOT match
  // all of our ignored patterns
  const doesNotMatchAllIgnoredPatterns = (file) => {
    // using {dot: true} here so that folders with a '.' in them are matched
    // as regular characters without needing an '.' in the
    // using {matchBase: true} here so that patterns without a globstar **
    // match against the basename of the file
    const MINIMATCH_OPTIONS = { dot: true, matchBase: true }
    return ignorePatterns.every((pattern) => {
      return !minimatch(file, pattern, MINIMATCH_OPTIONS)
    })
  }

  const filtered = files.filter(doesNotMatchAllIgnoredPatterns)
  debug('filtered %d specs', filtered.length)
  debug(filtered.join('\n'))

  return filtered
}

function getSpecs(options, type, returnAbsolute = false) {
  if (typeof options === 'undefined') {
    options = getConfig()
    if (typeof type === 'undefined') {
      type = 'e2e'
    }
  } else {
    // we might have resolved config object
    // passed from the "setupNode..." callback
    if ('testingType' in options) {
      type = options.testingType
      options = {
        version: options.version,
        projectRoot: options.projectRoot,
        [type]: {
          specPattern: options.specPattern,
          excludeSpecPattern: options.excludeSpecPattern,
        },
      }
    }
  }

  return findCypressSpecs(options, type, returnAbsolute)
}

/**
 * Finds Cypress specs.
 * @param {boolean} returnAbsolute Return the list of absolute spec filenames
 * @returns {string[]} List of filenames
 */
function findCypressSpecs(options, type = 'e2e', returnAbsolute = false) {
  debug('finding specs of type %s', type)
  if (options.version) {
    debug('Cypress version %s', options.version)
  }

  let cyVersion = options.version
  if (typeof cyVersion !== 'string') {
    if ('integrationFolder' in options) {
      cyVersion = '9.0.0'
    } else {
      cyVersion = '10.0.0'
    }
  }
  const [major] = cyVersion.split('.').map(Number)
  debug('treating options as Cypress version %d', major)

  if (type === 'e2e') {
    if (major >= 10) {
      debug('config has "e2e" property, treating as Cypress v10+')
      const specs = findCypressSpecsV10(options, type, returnAbsolute)
      return specs
    }

    debug('reading Cypress config < v10')
    const specs = findCypressSpecsV9(options, returnAbsolute)
    return specs
  } else if (type === 'component') {
    debug('finding component specs')
    const specs = findCypressSpecsV10(options, type, returnAbsolute)
    return specs
  } else {
    console.error('Do not know how to find specs of type "%s"', type)
    console.error('returning an empty list')
    return []
  }
}

function collectResults(structure, results) {
  structure.forEach((t) => {
    const info = {
      name: t.name,
      type: t.type,
      tags: t.tags,
      requiredTags: t.requiredTags,
    }
    if (t.pending) {
      info.pending = t.pending
    }
    if (t.exclusive) {
      info.exclusive = t.exclusive
    }
    debug('structure for %s', t.name)
    debug(info)

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
  debug(
    'finding changed files against %s using parent?',
    branch,
    Boolean(useParent),
  )

  if (useParent) {
    let result = shell.exec(`git merge-base origin/${branch} HEAD`, {
      silent: true,
    })
    if (result.code !== 0) {
      debugGit('git failed to find merge base with the branch %s', branch)
      return []
    }

    const commit = result.stdout.trim()
    debugGit('merge commit with branch "%s" is %s', branch, commit)
    result = shell.exec(`git diff --name-only --diff-filter=AMR ${commit}..`, {
      silent: true,
    })
    if (result.code !== 0) {
      debugGit('git diff failed with code %d', result.code)
      return []
    }

    const filenames = result.stdout
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    debugGit(
      'found %d changed files against branch %s',
      filenames.length,
      branch,
    )
    return filenames
  } else {
    const command = `git diff --name-only --diff-filter=AMR origin/${branch}`
    debugGit('command: %s', command)

    const result = shell.exec(command, { silent: true })
    if (result.code !== 0) {
      debugGit('git diff failed with code %d', result.code)
      return []
    }

    const filenames = result.stdout
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    debugGit(
      'found %d changed %s',
      filenames.length,
      pluralize('file', filenames.length),
    )
    return filenames
  }
}

/**
 * Collects all specs and for each finds all suits and tests with their tags.
 */
function getTests(specs, options = {}) {
  if (!specs) {
    specs = getSpecs()
  }

  const { tags, tagged, skipped } = options

  // counts the number of tests for each tag across all specs
  const tagTestCounts = {}
  const jsonResults = {}

  specs.forEach((filename) => {
    try {
      const source = fs.readFileSync(filename, 'utf8')
      const result = getTestNames(source, true)

      jsonResults[filename] = {
        counts: {
          tests: 0,
          pending: 0,
        },
        tests: [],
      }
      // enable if need to debug the parsed test
      // console.dir(result.structure, { depth: null })
      collectResults(result.structure, jsonResults[filename].tests)
      debug('collected results for file %s', filename)

      if (tags) {
        debug('counting tags', tags)
        const specTagCounts = countTags(result.structure)
        debug('spec tag counts')
        debug(specTagCounts)

        Object.keys(specTagCounts).forEach((tag) => {
          if (!(tag in tagTestCounts)) {
            tagTestCounts[tag] = specTagCounts[tag]
          } else {
            tagTestCounts[tag] += specTagCounts[tag]
          }
        })
      }
    } catch (e) {
      console.error('find-cypress-specs: problem parsing file %s', filename)
      delete jsonResults[filename]
    }
  })

  addCounts(jsonResults)
  debug('added counts')
  debug(jsonResults)

  if (tagged || tagged === '') {
    // filter all collected tests to those that have the given tag(s)
    const splitTags = tagged
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    debug('filtering all tests by tag %o', splitTags)
    pickTaggedTestsFrom(jsonResults, splitTags)
    debug('after picking tagged tests')
    debug(jsonResults)
    // recompute the number of tests
    debug('adding counts to json results')
    addCounts(jsonResults)
  } else if (skipped) {
    debug('leaving only skipped (pending) tests')
    leavePendingTestsOnly(jsonResults)
    // recompute the number of tests
    addCounts(jsonResults)
  }

  return { jsonResults, tagTestCounts }
}

module.exports = {
  getSpecs,
  // individual utilities
  getConfig,
  findCypressSpecs,
  collectResults,
  findChangedFiles,
  getTests,
}

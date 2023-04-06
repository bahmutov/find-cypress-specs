// @ts-check

const debug = require('debug')('find-cypress-specs')
const os = require('os')
const fs = require('fs')

function isNumber(n) {
  return typeof n === 'number' && !isNaN(n)
}

/**
 * Returns Markdown for a badge with the given number of tests.
 * @param {number} nE2E Number of end-to-end tests
 * @param {number|undefined} nComponent Number of component tests (optional)
 * @see https://shields.io/
 */
function getBadgeMarkdown(nE2E, nComponent) {
  debug('forming new test count badge with %o', { nE2E, nComponent })
  if (isNumber(nE2E)) {
    if (isNumber(nComponent)) {
      // we have both e2e and component tests
      return `![Cypress tests](https://img.shields.io/badge/cy%20tests-E2E%20${nE2E}%20%7C%20component%20${nComponent}-blue)`
    } else {
      // only e2e tests
      return `![Cypress tests](https://img.shields.io/badge/cy%20tests-E2E%20${nE2E}-blue)`
    }
  } else {
    if (isNumber(nComponent)) {
      // we have only the number of component tests
      return `![Cypress tests](https://img.shields.io/badge/cy%20tests-component%20${nComponent}-blue)`
    } else {
      // we have nothing
      return `![Cypress tests](https://img.shields.io/badge/cy%20tests-unknown-inactive)`
    }
  }
}

/**
 * Replaces the whole Markdown image badge with new badge with test counters.
 */
function replaceBadge({
  markdown, // current markdown text
  nE2E, // number of E2E tests
  nComponent, // number of component tests
}) {
  debug('replacing badge with new numbers %o', { nE2E, nComponent })
  const badgeRe = new RegExp(
    `\\!\\[Cypress tests\\]` +
      '\\(https://img\\.shields\\.io/badge/cy%20tests\\-' +
      '.+-(?:blue|inactive)\\)',
  )

  const badge = getBadgeMarkdown(nE2E, nComponent)
  debug('new badge contents "%s"', badge)
  let found

  let updatedReadmeText = markdown.replace(badgeRe, (match) => {
    found = true
    return badge
  })

  if (!found) {
    console.log('⚠️ Could not find test count badge')
    console.log('Insert new badge on the first line')
    debug('inserting new badge: %s', badge)

    const lines = markdown.split(os.EOL)
    if (lines.length < 1) {
      console.error('README file has no lines, cannot insert test count badge')
      return markdown
    }
    lines[0] += ' ' + badge
    updatedReadmeText = lines.join(os.EOL)
  } else {
    debug('replaced badge')
  }
  return updatedReadmeText
}

function updateBadge({ nE2E, nComponent }) {
  debug('reading in README file')
  // TODO: make the filename a parameter
  const filename = 'README.md'
  const readmeText = fs.readFileSync(filename, 'utf8')
  const maybeChangedText = replaceBadge({
    markdown: readmeText,
    nE2E,
    nComponent,
  })
  if (maybeChangedText !== readmeText) {
    console.log('saving updated readme with new test counts')
    fs.writeFileSync(filename, maybeChangedText, 'utf8')
  } else {
    debug('no updates to test counts')
  }
}

module.exports = { getBadgeMarkdown, replaceBadge, updateBadge }

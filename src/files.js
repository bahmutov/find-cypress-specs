// @ts-check
const { relative } = require('path')

/**
 * Converts a list of absolute filenames to the list of relative filenames
 * @param {string[]} filenames List of absolute filenames
 * @returns {string[]} List of relative filenames to the current working directory
 */
function toRelative(filenames) {
  const cwd = process.cwd()
  return filenames.map((filename) => relative(cwd, filename))
}

module.exports = { toRelative }

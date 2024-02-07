const requireAndForget = require('require-and-forget')
const { register } = require('node:module')
const { pathToFileURL } = require('node:url')

register('tsx/esm', {
  parentURL: pathToFileURL(__filename),
  data: true,
})

// @TODO: this is a pretty basic approach to try `require` first and fallback to `import`
// probably better to programmatically know how to determine which is required
// or even better to have one call that handles the compilation to use `require` or `import`
// @see https://github.com/TypeStrong/ts-node/discussions/1290
async function importFresh(specifier, module) {
  try {
    return requireAndForget(specifier)
  } catch {
    return import(`${specifier}?${Date.now()}`)
  }
}

module.exports = importFresh

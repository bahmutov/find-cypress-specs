const Module = require('module')
const { isAbsolute } = require('path')
const requireAndForget = require('require-and-forget')
const { register } = require('node:module')
const { pathToFileURL } = require('node:url')

register('tsx/esm', {
  parentURL: pathToFileURL(__filename),
  data: true,
})
// const tsNode = require('ts-node')
// tsNode.register({
//   transpileOnly: true,
//   compilerOptions: {
//     module: 'esnext',
//   },
//   esm: true,
// })

// @see https://github.com/TypeStrong/ts-node/discussions/1290
async function importFresh(specifier, module) {
  try {
    return requireAndForget(specifier)
  } catch {
    return import(`${specifier}?${Date.now()}`)
  }
}

module.exports = importFresh

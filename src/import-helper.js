const Module = require('module')
const { isAbsolute } = require('path')
const requireAndForget = require('require-and-forget')

// @see https://github.com/TypeStrong/ts-node/discussions/1290
async function importFresh(specifier, module) {
  if (isAbsolute) {
    return requireAndForget(specifier)
  }
  let resolvedPath
  try {
    const req = Module.createRequire(module.filename)
    try {
      resolvedPath = req.resolve(Path.posix.join(specifier, 'package.json'))
    } catch {
      resolvedPath = req.resolve(specifier)
    }
  } catch {
    throw new Error(
      `Unable to locate module "${specifier}" relative to "${module?.filename}" using the CommonJS resolver.  Consider passing an absolute path to the target module.`,
    )
  }
  return import(`${resolvedPath}?${Date.now()}`)
}

module.exports = importFresh

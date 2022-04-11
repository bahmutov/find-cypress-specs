const sinon = require('sinon')
const shell = require('shelljs')

const command = `git diff --name-only --diff-filter=AMR origin/tagged-1`
sinon
  .stub(shell, 'exec')
  .withArgs(command)
  .returns({
    code: 0,
    // return both spec files as changed against the branch "tagged-1"
    stdout: `
      cypress/e2e/featureA/user.ts
      cypress/e2e/spec.js
    `,
  })

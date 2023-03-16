const sinon = require('sinon')
const shell = require('shelljs')

const command = `git diff --name-only --diff-filter=AMR origin/tagged-1`
sinon
  .stub(shell, 'exec')
  .withArgs(command)
  .returns({
    code: 0,
    // return just one file as changed against the branch "tagged-1"
    // this spec file does NOT have any tests tagged "@alpha"
    stdout: `
      cypress/e2e/spec.cy.js
    `,
  })

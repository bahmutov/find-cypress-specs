const sinon = require('sinon')
const shell = require('shelljs')

const command = `git diff --name-only --diff-filter=AMR origin/branch-test-1`
sinon.stub(shell, 'exec').withArgs(command).returns({
  code: 0,
  stdout: 'cypress/e2e/featureA/user.ts',
})

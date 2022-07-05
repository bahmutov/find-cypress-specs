const sinon = require('sinon')
const shell = require('shelljs')

// first stub the finding of the parent commit
const command1 = 'git merge-base origin/parent-1 HEAD'
// then stub the finding of the files changed
const command2 = 'git diff --name-only --diff-filter=AMR commit-sha..'

sinon
  .stub(shell, 'exec')
  .withArgs(command1)
  .returns({
    code: 0,
    // the commit sha should be trimmed by the code
    stdout: '   commit-sha   ',
  })
  .withArgs(command2)
  .returns({
    code: 0,
    stdout: 'cypress/e2e/spec.cy.js',
  })

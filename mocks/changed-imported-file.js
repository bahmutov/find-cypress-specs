const sinon = require('sinon')
const shell = require('shelljs')
const path = require('path')
const specChange = require('spec-change')

// first stub the finding of the parent commit
const command1 = 'git merge-base origin/parent-3 HEAD'
// then stub the finding of the files changed
const command2 = 'git diff --name-only --diff-filter=AMR commit-sha..'

// Note: the stubs should work with the current Cypress specs in this repo

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
    // Git return utils file only for changed files
    stdout: `
      cypress/e2e/utils.js
    `,
  })

// stub the utility used to trace imports
sinon.stub(specChange, 'getDependsInFolder').returns({
  'e2e/utils.js': ['e2e/spec.cy.js'],
})

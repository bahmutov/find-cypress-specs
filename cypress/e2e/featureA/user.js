/// <reference types="cypress" />

// empty test
it('works', { tags: '@user' }, () => {})

// pending test needs to use it.skip
// since just not having a callback function is not enough
// https://github.com/cypress-io/cypress/issues/19701
it.skip('needs to be written', { tags: '@alpha' })

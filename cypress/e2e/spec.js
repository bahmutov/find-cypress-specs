/// <reference types="cypress" />

describe('parent suite', { tags: '@main' }, () => {
  it('works well enough', () => {})

  context('inner suite', () => {
    it('shows something', { tags: '@user' }, () => {})
  })
})

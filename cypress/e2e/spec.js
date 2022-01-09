/// <reference types="cypress" />

describe('parent suite', { tags: '@main' }, () => {
  it('works', () => {})

  describe('inner suite', () => {
    it('shows something', { tags: '@user' }, () => {})
  })
})

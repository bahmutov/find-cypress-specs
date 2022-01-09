/// <reference types="cypress" />

describe('parent suite', { tags: '@main' }, () => {
  it('works well enough', () => {})

  describe('inner suite', () => {
    it('shows something', { tags: '@user' }, () => {})
  })
})

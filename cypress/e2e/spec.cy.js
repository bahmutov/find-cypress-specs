/// <reference types="cypress" />

import './utils'

describe('parent suite', { tags: '@main' }, () => {
  it('works well enough', () => {})

  context('inner suite', () => {
    // beautiful test.
    it('shows something!', { tags: '@user' }, () => {})
  })
})

describe('empty parent suite', () => {
  context('inner suite', () => {
    it('shows something!', () => {})
  })
})

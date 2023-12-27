// the parent required tags should apply to the tests inside
// https://github.com/bahmutov/find-cypress-specs/issues/213

describe('parent', { requiredTags: '@parent' }, () => {
  it('child', () => {})
})

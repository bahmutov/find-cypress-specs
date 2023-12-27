// the parent required tags should apply to the tests inside
// https://github.com/bahmutov/find-cypress-specs/issues/213

// required test tag
describe('parent1', { requiredTags: '@parent1' }, () => {
  it('child1', () => {})
})

// normal test tag
describe('parent2', { tags: '@parent2' }, () => {
  it('child2', () => {})
})

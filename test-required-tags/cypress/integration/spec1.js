it('works', { tags: 'user', requiredTags: '@foo' }, () => {
  // something here
})

it('does not work', { requiredTags: ['@foo', '@bar'] }, () => {
  // something here
})

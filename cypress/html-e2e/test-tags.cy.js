import 'cypress-map'
import 'cypress-plugin-steps'
import { toHtml } from '../../src/output-html'

describe('HTML output', () => {
  const json = {
    'cypress/e2e/spec-b.cy.js': {
      counts: {
        tests: 1,
        pending: 0,
      },
      tests: [
        {
          name: 'works in spec B',
          type: 'test',
        },
      ],
    },
    'cypress/e2e/spec.cy.js': {
      counts: {
        tests: 3,
        pending: 0,
      },
      tests: [
        {
          name: 'parent suite',
          type: 'suite',
          tags: ['@main'],
          suites: [
            {
              name: 'inner suite A',
              type: 'suite',
              tests: [
                {
                  name: 'shows something!',
                  type: 'test',
                  tags: ['@user'],
                },
              ],
            },
          ],
          tests: [
            {
              name: 'works well enough',
              type: 'test',
            },
          ],
        },
        {
          name: 'Another suite',
          type: 'suite',
          suites: [
            {
              name: 'inner suite B',
              type: 'suite',
              tests: [
                {
                  name: 'deep test',
                  type: 'test',
                },
              ],
            },
          ],
        },
      ],
    },
    'cypress/e2e/featureA/user.cy.ts': {
      counts: {
        tests: 2,
        pending: 1,
      },
      tests: [
        {
          name: 'works',
          type: 'test',
          tags: ['@user'],
        },
        {
          name: 'needs to be written',
          type: 'test',
          tags: ['@alpha'],
          pending: true,
        },
      ],
    },
  }
  const tagTestCounts = { '@main': 2, '@user': 2, '@alpha': 1 }

  beforeEach(() => {
    const html = toHtml(json, tagTestCounts)
    cy.document({ log: false }).invoke('write', html)
  })

  it('shows filter tags in alphabetical order', () => {
    cy.get('.filter-tags').within(() => {
      cy.get('.filter-tag-name').should('read', ['@alpha', '@main', '@user'])
    })
  })

  it('filters tests by a tag', () => {
    cy.get('#specs-count').should('have.text', '3')
    cy.get('#tests-count').should('have.text', '6')

    cy.get('input[value="@user"]').check()

    cy.step('Check filtered tests')
    cy.get('#specs-count').should('have.text', '2')
    cy.get('#tests-count').should('have.text', '2')

    cy.step('Shows the specs')

    cy.get('ul.specs')
      .find('li.spec')
      .should('have.length', 2)
      .find('.filename')
      .should('read', [
        'cypress/e2e/spec.cy.js',
        'cypress/e2e/featureA/user.cy.ts',
      ])

    cy.step('Shows the tests names')
    cy.contains('li.spec', 'spec.cy.js').within(() => {
      cy.contains('li.test', 'shows something!')
    })

    cy.step('Check the second spec')
    cy.contains('li.spec', 'featureA/user.cy.ts').within(() => {
      cy.contains('li.test', 'works')
    })
  })

  it('shows all tests if no tag is selected', () => {
    cy.get('#specs-count').should('have.text', '3')
    cy.get('#tests-count').should('have.text', '6')

    cy.step('Filter by @user')
    cy.get('input[value="@user"]').check()
    cy.get('#specs-count').should('have.text', '2')
    cy.get('#tests-count').should('have.text', '2')
    cy.get('li.test').should('have.length', 2)

    cy.step('Back to all tests')
    cy.get('input[value="@user"]').uncheck()
    cy.get('#specs-count').should('have.text', '3')
    cy.get('#tests-count').should('have.text', '6')
    cy.get('li.test').should('have.length', 6)
  })

  it('uses OR to combine tags', () => {
    cy.step('Filter by @user')
    cy.get('input[value="@user"]').check()
    cy.get('#specs-count').should('have.text', '2')
    cy.get('#tests-count').should('have.text', '2')
    cy.get('li.test').should('have.length', 2)

    cy.step('Add filter @alpha')
    cy.get('input[value="@alpha"]').check()
    cy.get('input[value="@user"]').should('be.checked')
    cy.get('#specs-count').should('have.text', '2')
    cy.get('#tests-count').should('have.text', '3')
    cy.get('li.test').should('have.length', 3)
  })

  it('applies the parent suite tags', () => {
    cy.get('#specs-count').should('have.text', '3')
    cy.get('#tests-count').should('have.text', '6')

    cy.step('Filter by @main')
    cy.get('input[value="@main"]').check()
    cy.get('#specs-count').should('have.text', '1')
    cy.get('#tests-count').should('have.text', '2')
    cy.get('li.test')
      .should('have.length', 2)
      .find('.name')
      .should('read', ['shows something!', 'works well enough'])
  })

  it('shows the tag counts', () => {
    cy.get('.filter-tag-container').should('have.length', 3)
    cy.get('.filter-tag-container')
      .find('.filter-tag-name')
      .should('read', ['@alpha', '@main', '@user'])
    cy.get('.filter-tag-container')
      .find('.filter-tag-count')
      .should('read', ['(1)', '(2)', '(2)'])
  })
})

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

  it('should output HTML', () => {
    const html = toHtml(json)
    cy.document({ log: false }).invoke('write', html)

    cy.step('Title and header')
    cy.title().should('eq', 'Cypress Tests')
    cy.get('header').within(() => {
      cy.contains('h1', 'Cypress Tests')
      cy.contains('p', '3 specs, 6 tests')
    })
    cy.get('main').within(() => {
      cy.get('ul.specs').find('li.spec').should('have.length', 3)
      cy.get('.filename').should('read', [
        'cypress/e2e/spec-b.cy.js',
        'cypress/e2e/spec.cy.js',
        'cypress/e2e/featureA/user.cy.ts',
      ])
    })

    cy.step('List of specs')
    cy.contains('.spec', 'cypress/e2e/featureA/user.cy.ts').within(() => {
      cy.get('.tests .test').should('have.length', 2)
      cy.get('.tests .test')
        .first()
        .within(() => {
          cy.get('.name').should('have.text', 'works')
          cy.get('.tag').should('read', ['@user'])
        })
      cy.get('.tests .test')
        .last()
        .should('have.class', 'pending')
        .within(() => {
          cy.get('.name').should('have.text', 'needs to be written')
          cy.get('.tag').should('read', ['@alpha'])
        })
    })

    cy.step('Nested suite checks')
    cy.contains('.suite', 'parent suite').within(() => {
      // a suite has a test inside
      cy.contains('.test', 'works well enough')
      // a suite has a nested suite inside
      cy.contains('.suite', 'inner suite A').within(() => {
        cy.contains('.test', 'shows something!')
      })
    })

    cy.step('Another suite')
    cy.contains('.suite', 'Another suite').within(() => {
      cy.contains('.test', 'deep test')
    })
  })
})

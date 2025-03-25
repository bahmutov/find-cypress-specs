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
              name: 'inner suite',
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
          name: 'empty parent suite',
          type: 'suite',
          suites: [
            {
              name: 'inner suite',
              type: 'suite',
              tests: [
                {
                  name: 'shows something!',
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
    cy.contains('h1', 'Tests')
  })
})

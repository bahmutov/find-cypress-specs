// @ts-check

function testsToHtml(tests) {
  if (!Array.isArray(tests)) {
    return ''
  }
  return `
    <ul class="tests">
      ${tests
        .map((test) => {
          const tags = test.tags || []
          const tagList = tags
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join('\n')
          if (test.type === 'test') {
            const classNames = test.pending ? 'test pending' : 'test'
            return `<li class="${classNames}"><span class="name">${test.name}</span> ${tagList}</li>`
          } else if (test.type === 'suite') {
            return `<li class="suite"><span class="name">${test.name}</span> ${tagList}</li>`
          }
        })
        .join('\n')}
    </ul>
  `
}

/**
 * Takes the test JSON object with specs and tags
 * and returns a full static self-contained HTML file
 * that can be used to display the tests in a browser.
 */
function toHtml(testsJson) {
  const specsN = Object.keys(testsJson).length
  let testsN = 0
  Object.keys(testsJson).forEach((filename) => {
    const n = testsJson[filename].counts.tests
    testsN += n
  })

  const html = `
    <html>
      <head>
        <title>Cypress Tests</title>
        <style>
          .specs {
            list-style-type: none;
          }
          .tag {
            background-color: #f0f0f0;
            padding: 0.2em 0.5em;
            border-radius: 0.2em;
          }
          .suite {
            list-style-type: square;
          }
          .pending {
            opacity: 0.5;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Cypress Tests</h1>
          <p>
            ${specsN} specs, ${testsN} tests
          </p>
        </header>
        <main>
          <ul class="specs">
            ${Object.keys(testsJson)
              .map((filename) => {
                return `
                <li class="spec">
                  <h2>${filename}</h2>
                  ${testsToHtml(testsJson[filename].tests)}
                </li>
              `
              })
              .join('\n')}
          </ul>
        </main>
      </body>
    </html>
  `
  return html
}

module.exports = {
  toHtml,
}

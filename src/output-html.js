// @ts-check

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

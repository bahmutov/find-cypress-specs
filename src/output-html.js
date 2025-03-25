/**
 * Takes the test JSON object with specs and tags
 * and returns a full static self-contained HTML file
 * that can be used to display the tests in a browser.
 */
function toHtml(testsJons) {
  const html = `
    <html>
      <body>
        <h1>Tests</h1>
      </body>
    </html>
  `
  return html
}

module.exports = {
  toHtml,
}

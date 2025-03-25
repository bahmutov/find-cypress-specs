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
            const suitesHtml = testsToHtml(test.suites)
            const testsHtml = testsToHtml(test.tests)
            return `
              <li class="suite">
                <span class="name">${test.name}</span> ${tagList}
                ${suitesHtml}
                ${testsHtml}
              </li>
            `
          } else {
            throw new Error(`Unknown test type: ${test.type}`)
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
 * @param {Object} testsJson - The test JSON object with specs and tags
 * @param {Object} tagTestCounts - The tag test counts
 * @returns {string} - The HTML string
 */
function toHtml(testsJson, tagTestCounts = {}) {
  const specsN = Object.keys(testsJson).length
  let testsN = 0
  Object.keys(testsJson).forEach((filename) => {
    const n = testsJson[filename].counts.tests
    testsN += n
  })

  const allTags = Object.keys(tagTestCounts)

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
            padding: 0.1em 0.2em;
            border-radius: 0.2em;
          }
          .suite {
            list-style-type: square;
          }
          .test {
            list-style-type: circle;
          }
          .pending {
            opacity: 0.5;
          }
        </style>
        <script>
          window.findCypressSpecs = ${JSON.stringify({
            tests: testsJson,
            tags: tagTestCounts,
            selectedTags: [],
          })}
          window.findCypressSpecs.render = () => {
            // get the selected tags from the checkboxes
            const selectedTags = Array.from(document.querySelectorAll('input.filter-tag:checked'))
              .map((checkbox) => checkbox.value)
            console.log('selectedTags', selectedTags)
            // filter the tests based on the selected tags
          }
        </script>
      </head>
      <body>
        <header>
          <h1>Cypress Tests</h1>
          <p>
            ${specsN} specs, ${testsN} tests
          </p>
          <p class="filter-tags">
            ${allTags
              .map(
                (tag) =>
                  `<input type="checkbox" class="filter-tag" value="${tag}" onchange="window.findCypressSpecs.render()"/>
                     <span class="filter-tag-name">${tag}</span>`,
              )
              .join(' ')}
          </p>
        </header>
        <main>
          <ul class="specs">
            ${Object.keys(testsJson)
              .map((filename) => {
                return `
                <li class="spec">
                  <h2 class="filename">${filename}</h2>
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

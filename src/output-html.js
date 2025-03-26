// @ts-check

import {
  pickTaggedTestsFrom,
  pickTaggedTests,
  removeEmptyNodes,
  doTagsMatch,
  combineTags,
  preprocessAndTags,
} from './tagged'
const { addCounts, countTests, countPendingTests } = require('./count')

function countTheseTests(testsJson) {
  const specsN = Object.keys(testsJson).length
  let testsN = 0
  Object.keys(testsJson).forEach((filename) => {
    const n = testsJson[filename].counts.tests
    testsN += n
  })
  return { specsN, testsN }
}

// poor man's bundle
const htmlScripts = `
  ${countTheseTests.toString()}

  ${countPendingTests.toString()}

  ${addCounts.toString()}

  ${countTests.toString()}

  ${preprocessAndTags.toString()}

  ${doTagsMatch.toString()}

  ${combineTags.toString()}

  ${removeEmptyNodes.toString()}

  ${pickTaggedTests.toString()}

  ${pickTaggedTestsFrom.toString()}

  ${testsToHtml.toString()}
`

const styles = `
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --background-color: #f8f9fa;
    --text-color: #2c3e50;
    --border-color: #e9ecef;
    --tag-bg: #e3f2fd;
    --tag-color: #1976d2;
    --pending-color: #9e9e9e;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    margin: 0;
    padding: 2rem;
  }

  header {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0 0 1rem 0;
    color: var(--primary-color);
  }

  .filter-tags {
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-tag-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .filter-tag {
    margin-right: 0.1rem;
  }

  .filter-tag-name {
    color: var(--secondary-color);
    font-weight: 500;
  }

  .filter-tag-count {
    color: var(--pending-color);
    font-weight: 300;
  }

  .specs {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .spec {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .filename {
    color: var(--primary-color);
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  .tests {
    list-style-type: none;
    padding-left: 1.5rem;
    margin: 0;
  }

  .suite {
    margin: 0.5rem 0;
    color: var(--primary-color);
    font-weight: 500;
  }

  .test {
    margin: 0.25rem 0;
    color: var(--text-color);
  }

  .tag {
    background-color: var(--tag-bg);
    color: var(--tag-color);
    padding: 0.2em 0.5em;
    border-radius: 4px;
    font-size: 0.9em;
    margin-left: 0.5rem;
    font-weight: normal;
  }

  .pending {
    color: var(--pending-color);
    font-style: italic;
  }

  .name {
    font-weight: 500;
  }

  .test .name {
    font-weight: 300;
  }
`

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
  const { specsN, testsN } = countTheseTests(testsJson)

  // show tags in alphabetical order
  const allTags = Object.keys(tagTestCounts).sort()

  const html = `
    <html>
      <head>
        <title>Cypress Tests</title>
        <style>
          ${styles}
        </style>
        <script>
          ${htmlScripts}

          window.findCypressSpecs = ${JSON.stringify({
            tests: testsJson,
            tags: tagTestCounts,
            allTags,
            selectedTags: [],
          })}
          window.findCypressSpecs.render = () => {
            // get the selected tags from the checkboxes
            const selectedTags = Array.from(document.querySelectorAll('input.filter-tag:checked'))
              .map((checkbox) => checkbox.value)
            // filter the tests based on the selected tags

            let filtered = window.findCypressSpecs.tests
            if (selectedTags.length) {
              const testCopy = structuredClone(window.findCypressSpecs.tests)
              filtered = pickTaggedTestsFrom(testCopy, selectedTags)
            }
            const { specsN, testsN } = countTheseTests(filtered)
            document.querySelector('#specs-count').textContent = specsN
            document.querySelector('#tests-count').textContent = testsN

            // form the entire HTML first
            // then attach it to the DOM for speed
            let specsHtml = ''
            Object.keys(filtered).forEach(function (filename) {
              const tests = filtered[filename].tests
              specsHtml += '<li class="spec"><h2 class="filename">' + filename + '</h2>' + testsToHtml(tests) + '</li>'
            })

            const specsElement = document.querySelector('.specs')
            specsElement.innerHTML = specsHtml
          }
        </script>
      </head>
      <body>
        <header>
          <h1>Cypress Tests</h1>
          <p>
            <span id="specs-count">${specsN}</span> specs, <span id="tests-count">${testsN}</span> tests
          </p>
          <p class="filter-tags">
            ${allTags
              .map(
                (tag) =>
                  `<span class="filter-tag-container"><input type="checkbox" class="filter-tag" value="${tag}" onchange="window.findCypressSpecs.render()"/>
                     <span class="filter-tag-name">${tag}</span>
                     <span class="filter-tag-count">(${tagTestCounts[tag]})</span>
                  </span>`,
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

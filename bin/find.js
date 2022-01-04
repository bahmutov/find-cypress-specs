#!/usr/bin/env node

const { getConfig, findCypressSpecs } = require('../src')

const options = getConfig()
const specs = findCypressSpecs(options)
console.log(specs.join(','))

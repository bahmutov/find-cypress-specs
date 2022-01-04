#!/usr/bin/env node

const { getSpecs } = require('../src')

const specs = getSpecs()
console.log(specs.join(','))

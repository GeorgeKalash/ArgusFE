const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  requestTimeout: 20000,
  responseTimeout: 20000,
  viewportWidth: 1500,
  viewportHeight: 1200,
  numTestsKeptInMemory: 0,
  e2e: {
    baseUrl: 'http://localhost:3001'
  }
})

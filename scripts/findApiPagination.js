#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const SEARCH_ROOT = process.argv[2] || '.'

const EXCLUDED_PATHS = [
  'node_modules',
  'packages/module-ct',
  'packages/module-remittance'
]

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

function isExcluded(filePath) {
  return EXCLUDED_PATHS.some(excluded => filePath.includes(excluded))
}

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (isExcluded(fullPath)) continue

    if (entry.isDirectory()) {
      walkDir(fullPath, fileList)
    } else if (entry.isFile() && FILE_EXTENSIONS.includes(path.extname(entry.name))) {
      fileList.push(fullPath)
    }
  }

  return fileList
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // Must have paginationType='api' or paginationType="api"
  if (!/paginationType=["']api["']/.test(content)) return null

  // Find the endpointId line
  const lines = content.split('\n')
  const endpointLine = lines.find(line => /endpointId\s*:/.test(line))

  if (!endpointLine) return null

  // Skip if endpointId ends with .page — that's correct usage
  if (/\.page\b/.test(endpointLine)) return null

  return endpointLine.trim()
}

console.log(`Scanning: ${path.resolve(SEARCH_ROOT)}`)
console.log('----------------------------------------')

const files = walkDir(SEARCH_ROOT)
const issues = []

for (const file of files) {
  const endpointLine = checkFile(file)
  if (endpointLine) {
    issues.push({ file, endpointLine })
    console.log(file)
    console.log(`  endpointId line: ${endpointLine}`)
    console.log()
  }
}

console.log('----------------------------------------')
console.log(`Total files with issue: ${issues.length}`)
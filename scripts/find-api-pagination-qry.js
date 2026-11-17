const fs = require('fs')
const path = require('path')

const INDEX_FILES = ['index.js', 'index.jsx']
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next']
const EXCLUDE_PATHS = ['packages/module-ct', 'packages/module-remittance']

// paginationType='api' | paginationType="api" | paginationType={'api'}
const PAGINATION_API_REGEX = /paginationType\s*=\s*(\{\s*)?['"]api['"]/

// Captures the whole value after `extension:` / `endpointId:` (it may span several lines,
// e.g. a ternary), stopping at the next key (`parameters:`, `datasetId:` ...) or a closing brace.
const ENDPOINT_VALUE_REGEX =
  /\b(?:extension|endpointId)\s*:\s*([\s\S]*?)(?=,?\s*\n\s*[A-Za-z_$][\w$]*\s*:|\s*\n\s*\}|\s*\})/g

// XRepository.Something.qry
const QRY_REF_REGEX = /[\w$]+(?:\.[\w$]+)*\.qry\b/g

function findQryEndpoints(content) {
  const found = []
  for (const m of content.matchAll(ENDPOINT_VALUE_REGEX)) {
    const refs = m[1].match(QRY_REF_REGEX)
    if (refs) found.push(...refs)
  }
  return found
}

function getIndexFiles(dir, files = [], rootDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry.name)) continue

    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/')

    if (EXCLUDE_PATHS.some(p => relativePath === p || relativePath.startsWith(p + '/'))) continue

    if (entry.isDirectory()) {
      getIndexFiles(fullPath, files, rootDir)
    } else if (INDEX_FILES.includes(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function main() {
  const rootDir =
    process.argv.slice(2).find(a => !a.startsWith('--')) || process.cwd()

  console.log(`\n📁 Scanning: ${rootDir}`)
  console.log(`🚫 Excluding: ${EXCLUDE_PATHS.join(', ')}\n`)

  const files = getIndexFiles(rootDir, [], rootDir)
  const results = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')

    if (!PAGINATION_API_REGEX.test(content)) continue

    const qryMatches = findQryEndpoints(content)
    if (qryMatches.length === 0) continue

    results.push({
      file: path.relative(rootDir, file).replace(/\\/g, '/'),
      endpoints: [...new Set(qryMatches)]
    })
  }

  if (results.length === 0) {
    console.log('No matching screens found.')
    return
  }

  results.forEach(({ file, endpoints }) => {
    console.log(`  ${file}`)
    endpoints.forEach(e => console.log(`      → ${e}`))
  })

  console.log(`\n─────────────────────────────────────────`)
  console.log(`Found ${results.length} screen(s) with paginationType='api' using a .qry endpoint`)
}

main()
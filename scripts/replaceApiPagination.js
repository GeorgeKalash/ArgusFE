#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const SEARCH_ROOT = process.argv[2] || '.'
const DRY_RUN = process.argv.includes('--dry-run')

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

// Find all pages with paginationType='api' and endpointId using .qry
function findIssues(files) {
  const issues = []
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8')
    if (!/paginationType=["']api["']/.test(content)) continue
    const endpointMatch = content.match(/endpointId\s*:\s*([A-Za-z]+Repository)\.([A-Za-z]+)\.qry/)
    if (!endpointMatch) continue
    issues.push({
      filePath,
      repoName: endpointMatch[1],   // e.g. DocumentReleaseRepository
      objectName: endpointMatch[2], // e.g. CharacteristicsGeneral
    })
  }
  return issues
}

// Find the repository file for a given repo name
function findRepoFile(repoName) {
  const repoDir = path.join(SEARCH_ROOT, 'packages/repositories/src/repositories')
  const candidates = [
    path.join(repoDir, `${repoName}.js`),
    path.join(repoDir, `${repoName}.ts`),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  // Fallback: walk all files to find it
  const all = walkDir(path.join(SEARCH_ROOT, 'packages/repositories'))
  return all.find(f => path.basename(f, path.extname(f)) === repoName) || null
}

// Add page endpoint to the object in the repository file
function addPageToRepo(repoFilePath, objectName) {
  let content = fs.readFileSync(repoFilePath, 'utf8')

  // Check if page already exists for this object
  const alreadyHasPage = new RegExp(`${objectName}\\s*:\\s*\\{[^}]*page\\s*:`).test(content)
  if (alreadyHasPage) {
    return { skipped: true, reason: 'page already exists' }
  }

  // Find the object block and its qry line
  const objectRegex = new RegExp(
    `(${objectName}\\s*:\\s*\\{[^}]*?)(\\s*qry\\s*:\\s*[^,\\n]+)`,
    's'
  )

  const match = content.match(objectRegex)
  if (!match) {
    return { skipped: true, reason: `could not find ${objectName} object with qry` }
  }

  const qryLine = match[2]  // e.g.  \n    qry: service + 'qryCHA'

  // 1. Replace the key:  qry: -> page:
  // 2. Replace the value string: 'qryXYZ' -> 'pageXYZ'
  const pageLine = qryLine
    .replace(/qry\s*:/, 'page:')
    .replace(/(['"])qry([^'"]*)\1/, (_, q, suffix) => `${q}page${suffix}${q}`)

  // Insert page line before qry line
  const updated = content.replace(objectRegex, `$1${pageLine},$2`)

  if (updated === content) {
    return { skipped: true, reason: 'replacement had no effect' }
  }

  if (!DRY_RUN) {
    fs.writeFileSync(repoFilePath, updated, 'utf8')
  }

  return { skipped: false, pageLine: pageLine.trim() }
}

// Update the index file: replace .qry with .page for endpointId and extension
function updateIndexFile(filePath, repoName, objectName) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  // Replace endpointId: Repo.Object.qry -> .page
  const endpointRegex = new RegExp(`(endpointId\\s*:\\s*${repoName}\\.${objectName}\\.)qry`, 'g')
  if (endpointRegex.test(content)) {
    content = content.replace(new RegExp(`(endpointId\\s*:\\s*${repoName}\\.${objectName}\\.)qry`, 'g'), '$1page')
    changed = true
  }

  // Replace extension: Repo.Object.qry -> .page
  const extensionRegex = new RegExp(`(extension\\s*:\\s*${repoName}\\.${objectName}\\.)qry`, 'g')
  if (extensionRegex.test(content)) {
    content = content.replace(new RegExp(`(extension\\s*:\\s*${repoName}\\.${objectName}\\.)qry`, 'g'), '$1page')
    changed = true
  }

  if (changed && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8')
  }

  return changed
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`Scanning: ${path.resolve(SEARCH_ROOT)}`)
if (DRY_RUN) console.log('DRY RUN — no files will be modified\n')
console.log('─'.repeat(60))

const allFiles = walkDir(SEARCH_ROOT)
const issues = findIssues(allFiles)

if (issues.length === 0) {
  console.log('No issues found.')
  process.exit(0)
}

let successCount = 0
let skipCount = 0
let errorCount = 0

for (const { filePath, repoName, objectName } of issues) {
  console.log(`\nFile:   ${filePath}`)
  console.log(`Repo:   ${repoName}.${objectName}`)

  // 1. Find repository file
  const repoFilePath = findRepoFile(repoName)
  if (!repoFilePath) {
    console.log(`  ✗ Could not find repository file for ${repoName}`)
    errorCount++
    continue
  }
  console.log(`  Repo file: ${repoFilePath}`)

  // 2. Add page to repository
  const repoResult = addPageToRepo(repoFilePath, objectName)
  if (repoResult.skipped) {
    console.log(`  ~ Repo: ${repoResult.reason}`)
  } else {
    console.log(`  ✓ Repo: added "${repoResult.pageLine}"`)
  }

  // 3. Update index file
  const indexUpdated = updateIndexFile(filePath, repoName, objectName)
  if (indexUpdated) {
    console.log(`  ✓ Index: replaced .qry → .page`)
    successCount++
  } else {
    console.log(`  ~ Index: no replacements made`)
    skipCount++
  }
}

console.log('\n' + '─'.repeat(60))
console.log(`Done. Updated: ${successCount} | Skipped: ${skipCount} | Errors: ${errorCount}`)
if (DRY_RUN) console.log('(Dry run — no files were modified)')
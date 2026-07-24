const fs = require('fs')
const path = require('path')

const TABLE_COMPONENTS = [
  'Table',
  'DataGrid',
]

const EXTENSIONS = ['.jsx', '.js']
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next']
const EXCLUDE_PATHS = ['packages/module-ct', 'packages/module-remittance']

const DRY_RUN = process.argv.includes('--dry-run')
const REPORT_ONLY = process.argv.includes('--report')

function getAllFiles(dir, files = [], rootDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/')
    if (EXCLUDE_PATHS.some(p => relativePath === p || relativePath.startsWith(p + '/'))) continue
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files, rootDir)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }
  return files
}

function findOpeningTagEnd(content, startIdx) {
  let i = startIdx
  let braceDepth = 0
  let inString = null

  while (i < content.length) {
    const ch = content[i]

    if (inString) {
      if (ch === inString && content[i - 1] !== '\\') inString = null
      i++
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      i++
      continue
    }

    if (ch === '{') {
      braceDepth++
      i++
      continue
    }
    if (ch === '}') {
      braceDepth--
      i++
      continue
    }

    if (braceDepth === 0 && ch === '/' && content[i + 1] === '>') {
      return { end: i + 2, selfClosing: true }
    }
    if (braceDepth === 0 && ch === '>') {
      return { end: i + 1, selfClosing: false }
    }

    i++
  }
  return null
}

function detectAccessValue(content) {
  let match = content.match(/maxAccess=\{([^}]+)\}/)
  if (match) return { value: `{${match[1]}}`, source: 'maxAccess prop' }

  match = content.match(/(?<!max)access=\{([^}]+)\}/i)
  if (match) return { value: `{${match[1]}}`, source: 'access prop' }

  // destructured like: const { access } = ... OR const { access, ... } = ...
  if (/const\s*\{[^}]*\baccess\b[^}]*\}\s*=/.test(content)) {
    return { value: '{access}', source: 'destructured access variable' }
  }

  return null
}

function addMaxAccessToComponent(content, componentName, maxAccessValue) {
  let modified = false
  let result = content
  let searchFrom = 0

  while (true) {
    const openTag = `<${componentName}`
    const startIdx = result.indexOf(openTag, searchFrom)
    if (startIdx === -1) break

    const nextChar = result[startIdx + openTag.length]
    if (nextChar && /[A-Za-z0-9_]/.test(nextChar)) {
      searchFrom = startIdx + openTag.length
      continue
    }

    const tagEnd = findOpeningTagEnd(result, startIdx)
    if (!tagEnd) break

    const openingTag = result.slice(startIdx, tagEnd.end)

    if (!openingTag.includes('maxAccess')) {
      const lineStart = result.lastIndexOf('\n', startIdx) + 1
      const openingLine = result.slice(lineStart, startIdx)
      const indent = openingLine.match(/^(\s*)/)[1]

      const insertPos = tagEnd.selfClosing ? tagEnd.end - 2 : tagEnd.end - 1
      const insertion = `\n${indent}  maxAccess=${maxAccessValue}`
      result = result.slice(0, insertPos) + insertion + result.slice(insertPos)
      modified = true

      searchFrom = insertPos + insertion.length
    } else {
      searchFrom = tagEnd.end
    }
  }

  return { result, modified }
}

function fileUsesTableComponent(content) {
  return TABLE_COMPONENTS.some(comp => content.includes(`<${comp}`))
}

function main() {
  const rootDir = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || process.cwd()

  const mode = REPORT_ONLY ? '📋 REPORT ONLY — no files will be changed' : DRY_RUN ? '🔍 DRY RUN — no files will be changed' : '✏️  AUTO-FIX MODE — files will be modified'
  console.log(`\n${mode}`)
  console.log(`📁 Scanning: ${rootDir}`)
  console.log(`🚫 Excluding: ${EXCLUDE_PATHS.join(', ')}`)
  console.log(`🔎 Components: ${TABLE_COMPONENTS.join(', ')}\n`)

  const allFiles = getAllFiles(rootDir, [], rootDir)

  let totalFixed = 0
  let totalFiles = 0
  const skippedNoAccess = []  
  const alreadyOk = []     

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8')

    if (!fileUsesTableComponent(content)) continue

    const relativePath = path.relative(rootDir, file)

    const needsFix = TABLE_COMPONENTS.some(comp => {
      if (!content.includes(`<${comp}`)) return false
      let searchFrom = 0
      while (true) {
        const startIdx = content.indexOf(`<${comp}`, searchFrom)
        if (startIdx === -1) break
        const tagEnd = findOpeningTagEnd(content, startIdx)
        if (!tagEnd) break
        const openingTag = content.slice(startIdx, tagEnd.end)
        if (!openingTag.includes('maxAccess')) return true
        searchFrom = tagEnd.end
      }
      return false
    })

    if (!needsFix) {
      alreadyOk.push(relativePath)
      continue
    }

    const accessInfo = detectAccessValue(content)

    if (!accessInfo) {
      skippedNoAccess.push(relativePath)
      continue
    }

    if (REPORT_ONLY) {
      console.log(`  ⚠️  needs fix: ${relativePath}  (would use ${accessInfo.value}, detected via ${accessInfo.source})`)
      totalFiles++
      continue
    }

    let fileModified = false
    for (const comp of TABLE_COMPONENTS) {
      if (!content.includes(`<${comp}`)) continue
      const { result, modified } = addMaxAccessToComponent(content, comp, accessInfo.value)
      if (modified) {
        content = result
        fileModified = true
      }
    }

    if (fileModified) {
      totalFiles++
      if (DRY_RUN) {
        console.log(`  would fix: ${relativePath}  (using maxAccess=${accessInfo.value}, detected via ${accessInfo.source})`)
      } else {
        fs.writeFileSync(file, content, 'utf8')
        console.log(`  ✅ fixed: ${relativePath}  (using maxAccess=${accessInfo.value}, detected via ${accessInfo.source})`)
      }
      totalFixed++
    }
  }

  if (skippedNoAccess.length > 0) {
    console.log(`\n⚠️  Skipped (table/grid missing maxAccess, but screen has no access/maxAccess at all):`)
    skippedNoAccess.forEach(f => console.log(`   - ${f}`))
    console.log(`   → These screens may not implement access control yet — review manually.`)
  }

  console.log(`\n─────────────────────────────────────────`)
  if (REPORT_ONLY) {
    console.log(`Found ${totalFiles} screens needing a maxAccess fix`)
  } else if (DRY_RUN) {
    console.log(`Would fix ${totalFixed} instances across ${totalFiles} files`)
    console.log(`Run without --dry-run to apply changes`)
  } else {
    console.log(`✅ Fixed ${totalFixed} instances across ${totalFiles} files`)
  }
}

main()
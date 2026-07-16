const fs = require('fs')
const path = require('path')

// Add all your custom field components here
const COMPONENTS = [
  'CustomDatePicker',
  'CustomTextField',
  'ResourceComboBox',
  'CustomNumberField',
  'CustomTimePicker',
  'CustomCheckBox',
  'CustomTextArea',
  'ResourceLookup',
]

const EXTENSIONS = ['.jsx', '.js']
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next']
const EXCLUDE_PATHS = ['packages/module-ct', 'packages/module-remittance']

const DRY_RUN = process.argv.includes('--dry-run')

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

// Detect what value is used for maxAccess in this file e.g. {access} or {maxAccess}
function detectMaxAccessValue(content) {
  const match = content.match(/maxAccess=(\{[^}]+\})/)
  return match ? match[1] : null
}

function addMaxAccessToComponent(content, componentName, maxAccessValue) {
  let modified = false
  let result = content
  let searchFrom = 0

  while (true) {
    const openTag = `<${componentName}`
    const startIdx = result.indexOf(openTag, searchFrom)
    if (startIdx === -1) break

    const closeIdx = result.indexOf('/>', startIdx)
    if (closeIdx === -1) break

    const componentBlock = result.slice(startIdx, closeIdx + 2)

    if (!componentBlock.includes('maxAccess')) {
      const lineStart = result.lastIndexOf('\n', startIdx) + 1
      const openingLine = result.slice(lineStart, startIdx)
      const indent = openingLine.match(/^(\s*)/)[1]

      const newClose = `${indent}maxAccess=${maxAccessValue}\n${indent}/>`
      result = result.slice(0, closeIdx) + newClose + result.slice(closeIdx + 2)
      modified = true

      searchFrom = closeIdx + newClose.length
    } else {
      searchFrom = closeIdx + 2
    }
  }

  return { result, modified }
}

function main() {
  const rootDir = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || process.cwd()

  console.log(`\n${DRY_RUN ? '🔍 DRY RUN — no files will be changed' : '✏️  AUTO-FIX MODE — files will be modified'}`)
  console.log(`📁 Scanning: ${rootDir}`)
  console.log(`🚫 Excluding: ${EXCLUDE_PATHS.join(', ')}\n`)

  const allFiles = getAllFiles(rootDir, [], rootDir)
  let totalFixed = 0
  let totalFiles = 0
  const skipped = []

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8')

    // Check if this file has any of our components missing maxAccess
    const needsFix = COMPONENTS.some(comp => {
      if (!content.includes(`<${comp}`)) return false
      // Quick check: does any instance of this component NOT have maxAccess nearby
      let searchFrom = 0
      while (true) {
        const startIdx = content.indexOf(`<${comp}`, searchFrom)
        if (startIdx === -1) break
        const closeIdx = content.indexOf('/>', startIdx)
        if (closeIdx === -1) break
        const block = content.slice(startIdx, closeIdx + 2)
        if (!block.includes('maxAccess')) return true
        searchFrom = closeIdx + 2
      }
      return false
    })

    if (!needsFix) continue

    // Detect the maxAccess value used in this file
    const maxAccessValue = detectMaxAccessValue(content)

    if (!maxAccessValue) {
      // No existing maxAccess found in this file — skip and warn
      skipped.push(path.relative(rootDir, file))
      continue
    }

    let fileModified = false

    for (const comp of COMPONENTS) {
      if (!content.includes(`<${comp}`)) continue
      const { result, modified } = addMaxAccessToComponent(content, comp, maxAccessValue)
      if (modified) {
        content = result
        fileModified = true
        totalFixed++
      }
    }

    if (fileModified) {
      totalFiles++
      const relativePath = path.relative(rootDir, file)
      if (DRY_RUN) {
        console.log(`  would fix: ${relativePath}  (using maxAccess=${maxAccessValue})`)
      } else {
        fs.writeFileSync(file, content, 'utf8')
        console.log(`  ✅ fixed: ${relativePath}  (using maxAccess=${maxAccessValue})`)
      }
    }
  }

  if (skipped.length > 0) {
    console.log(`\n⚠️  Skipped (no existing maxAccess found to infer value from):`)
    skipped.forEach(f => console.log(`   - ${f}`))
    console.log(`   → Fix these manually or add maxAccess to one field first so the script can detect the value.`)
  }

  console.log(`\n─────────────────────────────────────────`)
  if (DRY_RUN) {
    console.log(`Would fix ${totalFixed} instances across ${totalFiles} files`)
    console.log(`Run without --dry-run to apply changes`)
  } else {
    console.log(`✅ Fixed ${totalFixed} instances across ${totalFiles} files`)
  }
}

main()
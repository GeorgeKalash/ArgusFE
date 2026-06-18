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

const EXTENSIONS = ['.jsx','.js']
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next']

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }
  return files
}

function findMissingMaxAccess(content, componentName) {
  const results = []
  let searchFrom = 0

  while (true) {
    const openTag = `<${componentName}`
    const startIdx = content.indexOf(openTag, searchFrom)
    if (startIdx === -1) break

    // Find the closing /> of this component instance
    const closeIdx = content.indexOf('/>', startIdx)
    if (closeIdx === -1) break

    const componentBlock = content.slice(startIdx, closeIdx + 2)

    if (!componentBlock.includes('maxAccess')) {
      // Get line number
      const lineNumber = content.slice(0, startIdx).split('\n').length
      // Get a short snippet (first line of the component)
      const snippet = componentBlock.split('\n')[0].trim()
      results.push({ lineNumber, snippet })
    }

    searchFrom = closeIdx + 2
  }

  return results
}

function main() {
  const rootDir = process.argv[2] || process.cwd()
  console.log(`\n🔍 Scanning: ${rootDir}\n`)

  const allFiles = getAllFiles(rootDir)
  const report = []

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8')
    const fileHits = []

    for (const comp of COMPONENTS) {
      if (!content.includes(`<${comp}`)) continue
      const missing = findMissingMaxAccess(content, comp)
      if (missing.length > 0) {
        fileHits.push({ component: comp, instances: missing })
      }
    }

    if (fileHits.length > 0) {
      report.push({ file: path.relative(rootDir, file), hits: fileHits })
    }
  }

  if (report.length === 0) {
    console.log('✅ All components have maxAccess!')
    return
  }

  let totalMissing = 0

  for (const entry of report) {
    console.log(`📄 ${entry.file}`)
    for (const hit of entry.hits) {
      for (const instance of hit.instances) {
        console.log(`   ❌  Line ${instance.lineNumber} — <${hit.component} - ${instance.snippet}`)
        totalMissing++
      }
    }
    console.log('')
  }

  console.log(`─────────────────────────────────────────`)
  console.log(`Total missing maxAccess: ${totalMissing} across ${report.length} files`)
}

main()
const fs = require('fs')
const path = require('path')

const ROOT = process.argv[2] || '.'
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']
const IGNORE = ['node_modules', '.next', 'dist', 'build', '.git']

const lockedRegex = /key:\s*['"]Locked['"]/
const hookRegex = /useRecordLock/

const missing = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.includes(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(full, 'utf8')

      if (lockedRegex.test(content) && !hookRegex.test(content)) {
        missing.push(full)
      }
    }
  }
}

walk(ROOT)

if (missing.length === 0) {
  console.log('All forms with a Locked button use useRecordLock.')
} else {
  console.log(`Found ${missing.length} file(s) with 'Locked' but no useRecordLock:\n`)
  missing.forEach(f => console.log(f))
}
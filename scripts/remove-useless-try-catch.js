const ts = require('typescript')
const fs = require('fs')
const path = require('path')

const packagesDir = path.resolve(__dirname, '../packages')

const dryRun = process.argv.includes('--dry')

const extensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

const ignoredFolders = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',

  // DO NOT TOUCH THESE MODULES
  'module-ct',
  'module-remittance'
])

function getFiles(dir) {
  if (!fs.existsSync(dir)) return []

  const files = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (ignoredFolders.has(entry.name)) {
        console.log(`Skipping: ${entry.name}`)
        continue
      }

      files.push(...getFiles(fullPath))
      continue
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function getScriptKind(file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (file.endsWith('.ts')) return ts.ScriptKind.TS
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX

  return ts.ScriptKind.JS
}

function hasEmptyCatch(node, sourceFile) {
  if (!node.catchClause) return false

  const block = node.catchClause.block

  return block.statements.length === 0 && !/\/\/|\/\*/.test(block.getText(sourceFile))
}

function containsAwait(block) {
  let found = false

  function visit(node) {
    if (found) return

    if (ts.isAwaitExpression(node)) {
      found = true
      return
    }

    if (ts.isFunctionLike(node)) return

    ts.forEachChild(node, visit)
  }

  ts.forEachChild(block, visit)

  return found
}

function collectBindingNames(name, names) {
  if (ts.isIdentifier(name)) {
    names.push(name.text)

    return
  }

  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) collectBindingNames(element.name, names)
  }
}

function getDeclaredNames(block) {
  const names = []

  for (const statement of block.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        collectBindingNames(declaration.name, names)
      }
    } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
      names.push(statement.name.text)
    }
  }

  return names
}

function usesAnyName(nodes, names) {
  let used = false

  function visit(node) {
    if (used) return

    if (ts.isIdentifier(node) && names.includes(node.text)) {
      used = true
      return
    }

    ts.forEachChild(node, visit)
  }

  nodes.forEach(visit)

  return used
}

/*
 * Only try/catch blocks that:
 *  - have an empty catch and no finally
 *  - wrap awaited code (requests handle their own errors)
 *  - don't declare names that would clash once the block is removed
 */
function isUseless(node, sourceFile) {
  if (node.finallyBlock || !hasEmptyCatch(node, sourceFile)) return false
  if (!node.tryBlock.statements.length || !containsAwait(node.tryBlock)) return false

  const parent = node.parent

  if (
    !ts.isBlock(parent) &&
    !ts.isSourceFile(parent) &&
    !ts.isCaseClause(parent) &&
    !ts.isDefaultClause(parent)
  ) {
    return false
  }

  const names = getDeclaredNames(node.tryBlock)

  if (!names.length) return true

  const others = parent.statements.filter(statement => statement !== node)

  if (ts.isBlock(parent) && ts.isFunctionLike(parent.parent)) {
    others.push(...parent.parent.parameters)
  }

  return !usesAnyName(others, names)
}

function findCandidate(sourceFile) {
  let candidate = null

  function visit(node) {
    if (candidate) return

    if (ts.isTryStatement(node) && isUseless(node, sourceFile)) {
      candidate = node
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return candidate
}

function findRemaining(sourceFile) {
  const lines = []

  function visit(node) {
    if (ts.isTryStatement(node) && hasEmptyCatch(node, sourceFile)) {
      lines.push(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return lines
}

function unwrap(text, node, sourceFile) {
  const block = node.tryBlock
  const innerStart = block.getStart(sourceFile) + 1
  const innerEnd = block.getEnd() - 1

  const templateRanges = []

  function collectTemplates(child) {
    if (ts.isNoSubstitutionTemplateLiteral(child) || ts.isTemplateExpression(child)) {
      templateRanges.push([child.getStart(sourceFile), child.getEnd()])
    }

    ts.forEachChild(child, collectTemplates)
  }

  collectTemplates(block)

  let offset = innerStart

  const body = text
    .slice(innerStart, innerEnd)
    .split('\n')
    .map(line => {
      const lineStart = offset

      offset += line.length + 1

      const insideTemplate = templateRanges.some(([start, end]) => lineStart > start && lineStart < end)

      return !insideTemplate && line.startsWith('  ') ? line.slice(2) : line
    })
    .join('\n')
    .trim()

  return text.slice(0, node.getStart(sourceFile)) + body + text.slice(node.getEnd())
}

function cleanFile(file) {
  const original = fs.readFileSync(file, 'utf8')

  if (!original.includes('catch')) return { removed: 0, remaining: [] }

  let text = original
  let removed = 0
  let sourceFile

  for (let i = 0; i < 100; i++) {
    sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, getScriptKind(file))

    const node = findCandidate(sourceFile)

    if (!node) break

    text = unwrap(text, node, sourceFile)
    removed++
  }

  const remaining = findRemaining(sourceFile)

  if (!removed) return { removed: 0, remaining }

  const testFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, getScriptKind(file))

  if (testFile.parseDiagnostics.length) {
    console.error(`❌ SKIPPED - syntax error: ${path.relative(packagesDir, file)}`)

    return { removed: 0, remaining }
  }

  if (!dryRun) fs.writeFileSync(file, text, 'utf8')

  return { removed, remaining }
}

// =====================================
// RUN
// =====================================

console.log(dryRun ? '\nDRY RUN - no files will be written\n' : '\nScanning packages...\n')

const files = getFiles(packagesDir)

console.log(`\nChecking ${files.length} JS/JSX/TS/TSX files...\n`)

let changedFiles = 0
let removedBlocks = 0

const review = []

for (const file of files) {
  const result = cleanFile(file)
  const relative = path.relative(packagesDir, file)

  result.remaining.forEach(line => review.push(`${relative}:${line}`))

  if (!result.removed) continue

  changedFiles++
  removedBlocks += result.removed

  console.log(`Cleaned: ${relative} (${result.removed} removed)`)
}

if (review.length) {
  console.log('\nEmpty catch left in place (sync code or name clash) - review manually:\n')
  review.forEach(item => console.log(`  ${item}`))
}

console.log('\n================================')
console.log('Finished')
console.log(`Files changed: ${changedFiles}`)
console.log(`try/catch removed: ${removedBlocks}`)
console.log('================================\n')
const ts = require('typescript')
const fs = require('fs')
const path = require('path')

const packagesDir = path.resolve(__dirname, '../packages')

const extensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx'
])

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

/*
 * Collect every identifier name used OUTSIDE import declarations.
 * One walk per file instead of one walk per imported name.
 * JSX tags like <CustomNumberField /> are identifiers in the AST,
 * so they are counted as usage.
 */
function collectUsedNames(sourceFile) {
  const names = new Set()

  function visit(node) {
    if (ts.isImportDeclaration(node)) return

    if (ts.isIdentifier(node)) {
      names.add(node.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return names
}

/*
 * JSX needs React in scope (classic runtime), so a file
 * that contains JSX uses React even if the word React
 * never appears in the code.
 */
function hasJsx(sourceFile) {
  let found = false

  function visit(node) {
    if (found) return

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      found = true
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return found
}

function getScriptKind(file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (file.endsWith('.ts')) return ts.ScriptKind.TS
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX

  return ts.ScriptKind.JS
}

function cleanFile(file) {
  const original = fs.readFileSync(file, 'utf8')

  const sourceFile = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true, getScriptKind(file))

  const fileHasJsx = hasJsx(sourceFile)
  const usedNames = collectUsedNames(sourceFile)

  const isUsed = identifier => (identifier.text === 'React' && fileHasJsx) || usedNames.has(identifier.text)

  const replacements = []

  let removedCount = 0

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue

    // Keep side-effect imports: import './something.css'
    if (!statement.importClause) continue

    const clause = statement.importClause

    let defaultImport = null
    let namespaceImport = null

    const namedImports = []

    let somethingRemoved = false

    // DEFAULT IMPORT
    if (clause.name) {
      if (isUsed(clause.name)) {
        defaultImport = clause.name.getText(sourceFile)
      } else {
        somethingRemoved = true
        removedCount++
      }
    }

    // NAMED / NAMESPACE IMPORTS
    if (clause.namedBindings) {
      // import * as Something from '...'
      if (ts.isNamespaceImport(clause.namedBindings)) {
        const identifier = clause.namedBindings.name

        if (isUsed(identifier)) {
          namespaceImport = identifier.getText(sourceFile)
        } else {
          somethingRemoved = true
          removedCount++
        }
      }

      // import { A, B as C } from '...'
      if (ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          // For aliases we check the LOCAL name (element.name)
          if (isUsed(element.name)) {
            namedImports.push(element.getText(sourceFile))
          } else {
            somethingRemoved = true
            removedCount++
          }
        }
      }
    }

    // Nothing unused in this import -> don't rewrite it
    if (!somethingRemoved) continue

    // EVERYTHING in this import is unused -> remove the whole statement
    if (!defaultImport && !namespaceImport && namedImports.length === 0) {
      // getStart() skips leading trivia (the previous line's newline).
      // getFullStart() would eat it and glue two imports together.
      const start = statement.getStart(sourceFile)
      let end = statement.getEnd()

      // Swallow trailing spaces + the line ending of THIS import only
      while (original[end] === ' ' || original[end] === '\t') end++
      if (original[end] === '\r') end++
      if (original[end] === '\n') end++

      replacements.push({ start, end, text: '' })

      continue
    }

    // Rebuild ONLY this import
    const parts = []

    if (defaultImport) parts.push(defaultImport)
    if (namespaceImport) parts.push(`* as ${namespaceImport}`)
    if (namedImports.length) parts.push(`{ ${namedImports.join(', ')} }`)

    const moduleSpecifier = statement.moduleSpecifier.getText(sourceFile)

    let newImport = `import ${parts.join(', ')} from ${moduleSpecifier}`

    // Preserve semicolon style
    const oldImport = original.slice(statement.getStart(sourceFile), statement.getEnd())

    if (oldImport.trimEnd().endsWith(';')) {
      newImport += ';'
    }

    replacements.push({
      start: statement.getStart(sourceFile),
      end: statement.getEnd(),
      text: newImport
    })
  }

  if (!replacements.length) {
    return { changed: false, removed: 0 }
  }

  // Work backwards so offsets don't move
  replacements.sort((a, b) => b.start - a.start)

  let result = original

  for (const replacement of replacements) {
    result = result.slice(0, replacement.start) + replacement.text + result.slice(replacement.end)
  }

  // SAFETY CHECK
  const testFile = ts.createSourceFile(file, result, ts.ScriptTarget.Latest, true, getScriptKind(file))

  if (testFile.parseDiagnostics.length) {
    console.error(`❌ SKIPPED - syntax error: ${path.relative(packagesDir, file)}`)
    console.error(
      testFile.parseDiagnostics
        .map(d => `   ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`)
        .join('\n')
    )

    return { changed: false, removed: 0 }
  }

  // Only write AFTER syntax validation
  fs.writeFileSync(file, result, 'utf8')

  return { changed: true, removed: removedCount }
}

// =====================================
// RUN
// =====================================

console.log('\nScanning packages...\n')

const files = getFiles(packagesDir)

console.log(`\nChecking ${files.length} JS/JSX/TS/TSX files...\n`)

let changedFiles = 0
let removedImports = 0

for (const file of files) {
  const result = cleanFile(file)

  if (!result.changed) continue

  changedFiles++
  removedImports += result.removed

  console.log(`Cleaned: ${path.relative(packagesDir, file)} (${result.removed} removed)`)
}

console.log('\n================================')
console.log('Finished')
console.log(`Files changed: ${changedFiles}`)
console.log(`Imports removed: ${removedImports}`)
console.log('================================\n')
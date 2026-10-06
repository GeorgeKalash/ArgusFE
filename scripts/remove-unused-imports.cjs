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

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
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
 * Check whether an identifier is actually used
 * somewhere outside its import declaration.
 */
function isIdentifierUsed(sourceFile, identifier) {
  const name = identifier.text

  let used = false

  function visit(node) {
    if (used) return

    /*
     * Don't count the import declaration itself
     * as usage.
     */
    let parent = node

    while (parent) {
      if (ts.isImportDeclaration(parent)) {
        return
      }

      parent = parent.parent
    }

    if (
      ts.isIdentifier(node) &&
      node.text === name
    ) {
      used = true
      return
    }

    ts.forEachChild(node, visit)
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      visit(statement)
    }
  }

  return used
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

    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      found = true
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return found
}

function getScriptKind(file) {
  if (file.endsWith('.tsx')) {
    return ts.ScriptKind.TSX
  }

  if (file.endsWith('.ts')) {
    return ts.ScriptKind.TS
  }

  if (file.endsWith('.jsx')) {
    return ts.ScriptKind.JSX
  }

  return ts.ScriptKind.JS
}

function cleanFile(file) {
  const original = fs.readFileSync(file, 'utf8')

  const sourceFile = ts.createSourceFile(
    file,
    original,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(file)
  )

  const fileHasJsx = hasJsx(sourceFile)

  const isUsed = identifier =>
    (identifier.text === 'React' && fileHasJsx) ||
    isIdentifierUsed(sourceFile, identifier)

  const replacements = []

  let removedCount = 0

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue
    }

    /*
     * Keep:
     *
     * import './something.css'
     */
    if (!statement.importClause) {
      continue
    }

    const clause = statement.importClause

    let defaultImport = null
    let namespaceImport = null

    const namedImports = []

    let somethingRemoved = false

    // --------------------------------
    // DEFAULT IMPORT
    // --------------------------------

    if (clause.name) {
      if (isUsed(clause.name)) {
        defaultImport =
          clause.name.getText(sourceFile)
      } else {
        somethingRemoved = true
        removedCount++
      }
    }

    // --------------------------------
    // NAMED / NAMESPACE IMPORTS
    // --------------------------------

    if (clause.namedBindings) {
      /*
       * import * as Something from '...'
       */
      if (
        ts.isNamespaceImport(
          clause.namedBindings
        )
      ) {
        const identifier =
          clause.namedBindings.name

        if (isUsed(identifier)) {
          namespaceImport =
            identifier.getText(sourceFile)
        } else {
          somethingRemoved = true
          removedCount++
        }
      }

      /*
       * import { A, B, C } from '...'
       */
      if (
        ts.isNamedImports(
          clause.namedBindings
        )
      ) {
        for (
          const element
          of clause.namedBindings.elements
        ) {
          /*
           * Important for aliases:
           *
           * import {
           *   Something as OtherName
           * } from '...'
           *
           * We check OtherName because that's
           * the local variable used by the file.
           */
          const localIdentifier = element.name

          if (isUsed(localIdentifier)) {
            // Preserve exact original text
            namedImports.push(
              element.getText(sourceFile)
            )
          } else {
            somethingRemoved = true
            removedCount++
          }
        }
      }
    }

    /*
     * Nothing unused in this import.
     *
     * DON'T rewrite it.
     */
    if (!somethingRemoved) {
      continue
    }

    /*
     * EVERYTHING from this import is unused.
     *
     * Remove the entire import.
     */
    if (
      !defaultImport &&
      !namespaceImport &&
      namedImports.length === 0
    ) {
      let start = statement.getFullStart()
      let end = statement.getEnd()

      /*
       * Include newline after the import so
       * we don't leave empty lines everywhere.
       */
      if (original[end] === '\r') {
        end++
      }

      if (original[end] === '\n') {
        end++
      }

      replacements.push({
        start,
        end,
        text: ''
      })

      continue
    }

    /*
     * Reconstruct ONLY this import.
     */
    const parts = []

    if (defaultImport) {
      parts.push(defaultImport)
    }

    if (namespaceImport) {
      parts.push(
        `* as ${namespaceImport}`
      )
    }

    if (namedImports.length) {
      parts.push(
        `{ ${namedImports.join(', ')} }`
      )
    }

    const moduleSpecifier =
      statement.moduleSpecifier.getText(
        sourceFile
      )

    let newImport =
      `import ${parts.join(', ')} from ${moduleSpecifier}`

    /*
     * Preserve semicolon style.
     */
    const oldImport = original.slice(
      statement.getStart(sourceFile),
      statement.getEnd()
    )

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
    return {
      changed: false,
      removed: 0
    }
  }

  /*
   * Work backwards so offsets don't move.
   */
  replacements.sort(
    (a, b) => b.start - a.start
  )

  let result = original

  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.start) +
      replacement.text +
      result.slice(replacement.end)
  }

  // -----------------------------------
  // SAFETY CHECK
  // -----------------------------------

  const testFile = ts.createSourceFile(
    file,
    result,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(file)
  )

  if (testFile.parseDiagnostics.length) {
    console.error(
      `❌ SKIPPED - syntax error: ${path.relative(
        packagesDir,
        file
      )}`
    )

    return {
      changed: false,
      removed: 0
    }
  }

  /*
   * Only write AFTER syntax validation.
   */
  fs.writeFileSync(
    file,
    result,
    'utf8'
  )

  return {
    changed: true,
    removed: removedCount
  }
}

// =====================================
// RUN
// =====================================

console.log('\nScanning packages...\n')

const files = getFiles(packagesDir)

console.log(
  `\nChecking ${files.length} JS/JSX/TS/TSX files...\n`
)

let changedFiles = 0
let removedImports = 0

for (const file of files) {
  const result = cleanFile(file)

  if (!result.changed) {
    continue
  }

  changedFiles++
  removedImports += result.removed

  console.log(
    `Cleaned: ${path.relative(
      packagesDir,
      file
    )} (${result.removed} removed)`
  )
}

console.log('\n================================')
console.log('Finished')
console.log(`Files changed: ${changedFiles}`)
console.log(`Imports removed: ${removedImports}`)
console.log('================================\n')
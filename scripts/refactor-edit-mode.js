#!/usr/bin/env node
/**
 * refactor-edit-mode.js
 *
 * Walks every file under ./packages (except module-ct and module-remittance) that uses `setEditMode`
 * and refactors it to the standard pattern:
 *
 *   FORMS   (useForm / useFormik)
 *     - removes  const [editMode, setEditMode] = useState(...)
 *     - removes  editMode / setEditMode from the props destructuring
 *     - removes  every standalone  setEditMode(...)  statement
 *     - adds     const editMode = !!formik.values.recordId   (right after the useForm/useFormik call)
 *
 *   WINDOWS (tabs, no formik, own useState for editMode)
 *     - const [editMode, setEditMode] = useState(recordId)  ->  const editMode = !!recordId
 *     - removes setEditMode={setEditMode} (and editMode={editMode}) from the children that were refactored
 *     - drops the editMode declaration completely if nothing uses it anymore
 *
 *   LIST/OTHER files that only receive setEditMode as an unused prop
 *     - setEditMode is stripped from the props destructuring
 *
 * Safety:
 *   - DRY RUN by default. Nothing is written unless you pass --write.
 *   - All-or-nothing per file: if anything unexpected remains (e.g. `.then(() => setEditMode(true))`),
 *     the file is left untouched and listed under "MANUAL".
 *   - CRLF files are preserved.
 *
 * Usage (from the repo root, ArgusFE):
 *   node refactor-edit-mode.js            # dry run, prints a report
 *   node refactor-edit-mode.js --write    # apply the changes
 *   node refactor-edit-mode.js path/to/dir --write
 *
 * Afterwards run:  npx prettier --write <changed files>   and review with  git diff
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const ROOT = path.resolve(args.find(a => !a.startsWith('--')) || 'packages')
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'module-ct', 'module-remittance'])
const EXTS = ['.js', '.jsx', '.ts', '.tsx']

const LOCAL_STATE_RE = /^([ \t]*)const\s*\[\s*editMode\s*,\s*setEditMode\s*\]\s*=\s*useState\(([^\n]*)\)[ \t]*;?[ \t]*\n/m
const SET_CALL_LINE_RE = /^[ \t]*setEditMode\([^)\n]*\)[ \t]*;?[ \t]*\n/gm
const FORMIK_HOOK_RE = /const\s+(?:\{\s*formik\s*\}|formik)\s*=\s*(?:useForm|useFormik)\s*\(/

/* ------------------------------------------------------------------ helpers */

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), acc)
    } else if (EXTS.includes(path.extname(entry.name))) {
      acc.push(path.join(dir, entry.name))
    }
  }
  return acc
}

function skipString(s, i) {
  const q = s[i]
  for (i++; i < s.length; i++) {
    if (s[i] === '\\') i++
    else if (s[i] === q) return i
  }
  return -1
}

/** index of the bracket that closes the one at `i` (skips strings and comments) */
function findClosing(s, i) {
  const closer = { '(': ')', '[': ']', '{': '}' }
  const stack = []
  for (; i < s.length; i++) {
    const c = s[i]
    const n = s[i + 1]
    if (c === '/' && n === '/') {
      i = s.indexOf('\n', i)
      if (i < 0) return -1
    } else if (c === '/' && n === '*') {
      i = s.indexOf('*/', i + 2)
      if (i < 0) return -1
      i++
    } else if (c === "'" || c === '"' || c === '`') {
      i = skipString(s, i)
      if (i < 0) return -1
    } else if (closer[c]) {
      stack.push(closer[c])
    } else if (c === ')' || c === ']' || c === '}') {
      if (stack.pop() !== c) return -1
      if (!stack.length) return i
    }
  }
  return -1
}

/** removes names from the first `({ a, b, c })` component props destructuring that contains one of them */
function stripProps(src, names) {
  const re = /(?:function\s+\w+\s*|const\s+\w+\s*=\s*(?:async\s*)?)\(\s*\{([^}]*)\}/g
  let m
  while ((m = re.exec(src))) {
    if (!names.some(n => new RegExp(`\\b${n}\\b`).test(m[1]))) continue
    let params = m[1]
    for (const n of names) {
      params = params.replace(new RegExp(`\\b${n}\\b\\s*,\\s*`), '').replace(new RegExp(`,\\s*\\b${n}\\b`), '')
    }
    if (names.some(n => new RegExp(`\\b${n}\\b`).test(params))) return { error: 'could not strip props cleanly' }
    const replaced = m[0].replace(/\{([^}]*)\}/, () => `{${params}}`)
    return { out: src.slice(0, m.index) + replaced + src.slice(m.index + m[0].length) }
  }
  return { out: src }
}

function dropUnusedUseState(src) {
  if ((src.match(/\buseState\b/g) || []).length > 1) return src
  return src.replace(/import\s+((?:\w+\s*,\s*)?)\{([^}]*)\}\s*from\s*'react'[ \t]*;?[ \t]*\n/, (full, def, list) => {
    const items = list.split(',').map(s => s.trim()).filter(s => s && s !== 'useState')
    if (items.length) return `import ${def}{ ${items.join(', ')} } from 'react'\n`
    if (def) return `import ${def.replace(/\s*,\s*$/, '')} from 'react'\n`
    return ''
  })
}

function tidy(src) {
  return src.replace(/\n{3,}/g, '\n\n')
}

function remainingLines(src, word) {
  return src
    .split('\n')
    .map((l, i) => (new RegExp(`\\b${word}\\b`).test(l) ? `L${i + 1}: ${l.trim()}` : null))
    .filter(Boolean)
}

/** removes props from <Name ...> opening tags */
function stripTagProps(src, name, props) {
  const re = new RegExp(`<${name}(?=[\\s/>])`, 'g')
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length
    let depth = 0
    for (; i < src.length; i++) {
      const c = src[i]
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '>' && depth === 0) break
    }
    let tag = src.slice(m.index, i + 1)
    for (const p of props) tag = tag.replace(new RegExp(`\\s*\\b${p}=\\{${p}\\}`, 'g'), '')
    out += src.slice(last, m.index) + tag
    last = i + 1
    re.lastIndex = i + 1
  }
  return out + src.slice(last)
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null
  const base = path.resolve(path.dirname(fromFile), spec)
  const candidates = [base, ...EXTS.map(e => base + e), ...EXTS.map(e => path.join(base, 'index' + e))]
  return candidates.find(c => fs.existsSync(c) && fs.statSync(c).isFile()) || null
}

function relativeImports(file, src) {
  const found = []
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+'(\.[^']+)'/g)) found.push([m[1], resolveImport(file, m[2])])
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*'(\.[^']+)'/g)) {
    const target = resolveImport(file, m[2])
    m[1].split(',').forEach(part => {
      const local = part.split(/\s+as\s+/).pop().trim()
      if (local) found.push([local, target])
    })
  }
  return found.filter(([, t]) => t)
}

/* ---------------------------------------------------------------- refactors */

function refactorForm(src) {
  let out = src
  out = out.replace(LOCAL_STATE_RE, '')
  out = out.replace(SET_CALL_LINE_RE, '')

  const stripped = stripProps(out, ['editMode', 'setEditMode'])
  if (stripped.error) return { error: stripped.error }
  out = stripped.out

  const left = remainingLines(out, 'setEditMode')
  if (left.length) return { error: 'setEditMode still used in a non-standard way:\n        ' + left.join('\n        ') }

  const m = FORMIK_HOOK_RE.exec(out)
  if (!m) return { error: 'formik hook not in a recognised shape (expected `const { formik } = useForm(` or `const formik = useFormik(`)' }

  const open = m.index + m[0].length - 1
  const close = findClosing(out, open)
  if (close < 0) return { error: 'could not match the useForm(...) parentheses' }

  const call = out.slice(open, close + 1)
  if (!/\brecordId\b/.test(call)) return { error: 'formik initialValues has no top-level recordId, so editMode cannot be derived' }
  if (/\beditMode\b/.test(call)) return { error: 'editMode is referenced inside the useForm(...) arguments' }

  const needsEditMode = /\beditMode\b/.test(out) && !/const\s+editMode\b/.test(out)
  if (needsEditMode) {
    const lineStart = out.lastIndexOf('\n', m.index) + 1
    const indent = out.slice(lineStart, m.index).match(/^[ \t]*/)[0]
    const eol = out.indexOf('\n', close)
    const at = eol < 0 ? out.length : eol
    out = out.slice(0, at) + `\n\n${indent}const editMode = !!formik.values.recordId` + out.slice(at)
  }

  return { out: tidy(dropUnusedUseState(out)), keepsEditMode: false }
}

function refactorPropsOnly(src) {
  const stripped = stripProps(src, ['setEditMode'])
  if (stripped.error) return { error: stripped.error }
  const left = remainingLines(stripped.out, 'setEditMode')
  if (left.length) return { error: 'setEditMode is actually used here (not only received):\n        ' + left.join('\n        ') }
  const keepsEditMode = /\beditMode\b/.test(stripped.out)
  return {
    out: tidy(stripped.out),
    keepsEditMode,
    warn: keepsEditMode ? 'still consumes an `editMode` prop from its parent' : null
  }
}

function refactorWindow(file, src, refactored) {
  const decl = LOCAL_STATE_RE.exec(src)
  const init = decl[2].trim()
  if (!['recordId', '!!recordId', 'Boolean(recordId)'].includes(init)) {
    return { error: `useState initial value is \`${init}\` (expected recordId / !!recordId)` }
  }

  let out = src.replace(LOCAL_STATE_RE, (_, indent) => `${indent}const editMode = !!recordId\n`)

  for (const [local, target] of relativeImports(file, src)) {
    const info = refactored.get(target)
    if (!info) continue
    out = stripTagProps(out, local, info.keepsEditMode ? ['setEditMode'] : ['setEditMode', 'editMode'])
  }

  const left = remainingLines(out, 'setEditMode')
  if (left.length) return { error: 'setEditMode is still passed to a child that was not refactored:\n        ' + left.join('\n        ') }

  const total = (out.match(/\beditMode\b/g) || []).length
  const asProp = (out.match(/=\{editMode\}/g) || []).length
  let warn = null

  if (total === 1) {
    out = out.replace(/^[ \t]*const editMode = !!recordId[ \t]*\n/m, '')
  } else if (total - 1 - asProp > 0) {
    warn = 'uses `editMode` in logic (e.g. tab `disabled`); it is now static (!!recordId) and will NOT flip after the first save. Consider `!!store.recordId`.'
  }

  return { out: tidy(dropUnusedUseState(out)), warn }
}

/* --------------------------------------------------------------------- main */

if (!fs.existsSync(ROOT)) {
  console.error(`Folder not found: ${ROOT}\nRun this from the ArgusFE root or pass the packages path.`)
  process.exit(1)
}

const files = walk(ROOT)
  .map(file => {
    const raw = fs.readFileSync(file, 'utf8')
    return { file, raw, crlf: raw.includes('\r\n'), src: raw.replace(/\r\n/g, '\n') }
  })
  .filter(f => f.src.includes('setEditMode'))

const report = { changed: [], manual: [], warnings: [] }
const refactored = new Map()
const rel = f => path.relative(process.cwd(), f)

function commit(entry, result) {
  if (result.error) {
    report.manual.push(`${rel(entry.file)}\n      -> ${result.error}`)
    return false
  }
  if (result.warn) report.warnings.push(`${rel(entry.file)}\n      -> ${result.warn}`)
  if (result.out !== entry.src) {
    report.changed.push(rel(entry.file))
    if (WRITE) fs.writeFileSync(entry.file, entry.crlf ? result.out.replace(/\n/g, '\r\n') : result.out, 'utf8')
  }
  return true
}

const hasFormik = s => /\b(useForm|useFormik)\s*\(/.test(s)
const hasLocalState = s => LOCAL_STATE_RE.test(s)

// pass 1: forms and prop-only files (children first, so windows can look them up)
for (const entry of files) {
  if (hasFormik(entry.src)) {
    const r = refactorForm(entry.src)
    if (commit(entry, r)) refactored.set(entry.file, { keepsEditMode: false })
  } else if (!hasLocalState(entry.src)) {
    const r = refactorPropsOnly(entry.src)
    if (commit(entry, r)) refactored.set(entry.file, { keepsEditMode: r.keepsEditMode })
  }
}

// pass 2: windows (own editMode state, no formik)
for (const entry of files) {
  if (!hasFormik(entry.src) && hasLocalState(entry.src)) commit(entry, refactorWindow(entry.file, entry.src, refactored))
}

console.log(`\n${WRITE ? 'APPLIED' : 'DRY RUN (nothing written, pass --write to apply)'}`)
console.log(`Scanned ${files.length} file(s) containing setEditMode under ${rel(ROOT) || '.'}\n`)

console.log(`CHANGED (${report.changed.length})`)
report.changed.forEach(f => console.log('  ' + f))

console.log(`\nWARNINGS - changed, but please eyeball (${report.warnings.length})`)
report.warnings.forEach(w => console.log('  ' + w))

console.log(`\nMANUAL - left untouched (${report.manual.length})`)
report.manual.forEach(m => console.log('  ' + m))

console.log('\nNext: npx prettier --write on the changed files, then review with git diff.\n')
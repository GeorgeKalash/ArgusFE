#!/usr/bin/env node
/**
 * migrate-combo-store.js
 *
 * Migrates forms that use:
 *     const [store, setStore] = useState({ ... })
 *     const fillCombos = async () => { ... getRequest({ extension: X.pack }) ... setStore({...}) }
 *     <ResourceComboBox store={store?.something} />
 * to:
 *     const { combosStore } = useComboStore(X.pack)
 *     <ResourceComboBox store={combosStore?.something} />
 *
 * Usage (run from the project root, e.g. in the VS Code terminal):
 *     node migrate-combo-store.js                 -> dry run on current folder (nothing is written)
 *     node migrate-combo-store.js --write         -> apply changes
 *     node migrate-combo-store.js ./packages --write
 *
 * Tip: commit or stash first so you can review the result with `git diff`.
 */

const fs = require('fs')
const path = require('path')

// ---- config -------------------------------------------------------------
const IMPORT_PATH = '@argus/shared-hooks/src/hooks/useComboStore'
const HOOK_NAME = 'useComboStore'
const NEW_STORE_NAME = 'combosStore'
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const IGNORE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage'])
// -------------------------------------------------------------------------

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const root = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd())

function skipString(src, i) {
  const q = src[i]
  for (i++; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue }
    if (src[i] === q) return i
  }
  return src.length
}

// returns index of the bracket that closes the one at openIdx (ignores strings/comments)
function findClose(src, openIdx) {
  const open = src[openIdx]
  const close = { '{': '}', '(': ')', '[': ']' }[open]
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i === -1) return -1; continue }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i); if (i === -1) return -1; i++; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
  }
  return -1
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function transform(src) {
  const warnings = []
  const eol = src.includes('\r\n') ? '\r\n' : '\n'

  if (src.includes(HOOK_NAME)) return { skip: 'already migrated' }
  if (!/<ResourceComboBox[\s\S]*?\bstore=/.test(src)) return { skip: 'no ResourceComboBox with store' }

  // 1) locate fillCombos
  const fm =
    /^([ \t]*)(?:const\s+fillCombos\s*=\s*async\s*(?:\(\s*\)|\w+)\s*=>\s*|async\s+function\s+fillCombos\s*\(\s*\)\s*)\{/m.exec(src)
  if (!fm) return { manual: 'ResourceComboBox with store found, but no fillCombos function' }

  const indent = fm[1]
  const bodyOpen = fm.index + fm[0].length - 1
  const bodyClose = findClose(src, bodyOpen)
  if (bodyClose === -1) return { manual: 'could not match fillCombos braces' }
  const body = src.slice(bodyOpen + 1, bodyClose)

  // 2) the api passed to the hook = the extension used inside fillCombos
  const exts = [...body.matchAll(/extension:\s*([\w.]+)/g)].map(m => m[1])
  if (exts.length === 0) return { manual: 'no "extension:" found inside fillCombos' }
  if (new Set(exts).size > 1) return { manual: 'fillCombos calls more than one endpoint' }
  const api = exts[0]

  // setter used in fillCombos, e.g. setStore({
  const setterMatch = /\b(set\w+)\(\s*\{/.exec(body)
  const setter = setterMatch ? setterMatch[1] : null
  if (/\.(filter|map|reduce|find)\(/.test(body)) {
    warnings.push(
      'fillCombos contained filter/map logic (e.g. documentTypes filtered by activeStatus). ' +
        'The hook does not do this: move it to the combo "filter" prop if needed.'
    )
  }

  // 3) remove fillCombos (and one trailing blank line)
  let removeStart = fm.index
  let removeEnd = bodyClose + 1
  const after = /^[ \t]*\r?\n(?:[ \t]*\r?\n)?/.exec(src.slice(removeEnd))
  if (after) removeEnd += after[0].length
  let out = src.slice(0, removeStart) + src.slice(removeEnd)

  const hookLine = `const { ${NEW_STORE_NAME}, fillCombos } = ${HOOK_NAME}(${api})`

  // 4) replace the useState store block with the hook (same place)
  let storeName = 'store'
  let replaced = false
  if (setter) {
    const sm = new RegExp(
      `^([ \\t]*)const\\s*\\[\\s*(\\w+)\\s*,\\s*${setter}\\s*\\]\\s*=\\s*useState\\(`,
      'm'
    ).exec(out)
    if (sm) {
      storeName = sm[2]
      const parenOpen = sm.index + sm[0].length - 1
      const parenClose = findClose(out, parenOpen)
      if (parenClose !== -1) {
        let end = parenClose + 1
        if (out[end] === ';') end++
        out = out.slice(0, sm.index) + sm[1] + hookLine + out.slice(end)
        replaced = true
      }
    }
  }
  if (!replaced) {
    // fallback: put the hook where fillCombos used to be
    out = out.slice(0, removeStart) + indent + hookLine + eol + eol + out.slice(removeStart)
    warnings.push('useState store block not found: hook inserted where fillCombos was, check position')
  }

  // 5) store?. -> combosStore?.
  let count = 0
  const refRe = new RegExp(`(?<![\\w.$])${escapeRe(storeName)}(\\??)\\.(?=\\w)`, 'g')
  out = out.replace(refRe, (_, q) => {
    count++
    return `${NEW_STORE_NAME}${q}.`
  })
  if (count === 0) warnings.push(`no "${storeName}?." references found`)

  // 6) add import after the last import
  const importRe = /^import[\s\S]*?from\s+['"][^'"]+['"][ \t]*;?[ \t]*$/gm
  let last = null
  for (const m of out.matchAll(importRe)) last = m
  const semi = last && last[0].trim().endsWith(';') ? ';' : ''
  const importLine = `import { ${HOOK_NAME} } from '${IMPORT_PATH}'${semi}`
  if (last) {
    const pos = last.index + last[0].length
    out = out.slice(0, pos) + eol + importLine + out.slice(pos)
  } else {
    out = importLine + eol + out
  }

  if (!/\bfillCombos\(/.test(out.replace(hookLine, ''))) {
    warnings.push('fillCombos is never called in this file, add it in a useEffect')
  }

  return { out, api, count, warnings }
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name))
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      yield path.join(dir, entry.name)
    }
  }
}

const changed = []
const manual = []
const warned = []

for (const file of walk(root)) {
  const src = fs.readFileSync(file, 'utf8')
  if (!src.includes('ResourceComboBox')) continue
  const rel = path.relative(root, file)
  const res = transform(src)

  if (res.skip) continue
  if (res.manual) { manual.push(`${rel}  ->  ${res.manual}`); continue }

  changed.push(`${rel}  (${res.api}, ${res.count} store refs)`)
  res.warnings.forEach(w => warned.push(`${rel}  ->  ${w}`))
  if (WRITE) fs.writeFileSync(file, res.out, 'utf8')
}

console.log(`\n${WRITE ? 'UPDATED' : 'WOULD UPDATE (dry run, use --write)'}: ${changed.length} file(s)`)
changed.forEach(l => console.log('  ✔ ' + l))
if (warned.length) {
  console.log(`\nREVIEW (${warned.length}):`)
  warned.forEach(l => console.log('  ! ' + l))
}
if (manual.length) {
  console.log(`\nNEEDS MANUAL MIGRATION (${manual.length}):`)
  manual.forEach(l => console.log('  ✘ ' + l))
}
console.log()
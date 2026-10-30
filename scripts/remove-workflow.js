#!/usr/bin/env node
/**
 * Removes the WorkFlow feature from React files.
 *
 * For every file that contains:
 *   import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
 * it will:
 *   1. remove that import
 *   2. remove the onWorkFlow function
 *   3. remove the WorkFlow entry from the `actions` array.
 *      If it was the only action, remove the whole `actions` array
 *      and its usage (actions={actions}).
 *
 * Usage:
 *   node remove-workflow.js [folder] [--dry]
 *
 *   folder   folder to scan (default: current folder)
 *   --dry    only print what would change, don't write files
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const ROOT = path.resolve(args.find(a => !a.startsWith('--')) || '.')

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage'])

const IMPORT_RE = /^[ \t]*import\s+WorkFlow\s+from\s+['"]@argus\/shared-ui\/src\/components\/Shared\/WorkFlow['"][ \t]*;?[ \t]*\r?\n?/m

/* ---------------------------- helpers ---------------------------- */

// If src[i] starts a string or a comment, return the index just after it, else return i
function skipLiteral(src, i) {
  const c = src[i]
  const n = src[i + 1]

  if (c === '/' && n === '/') {
    const e = src.indexOf('\n', i)

    return e === -1 ? src.length : e
  }
  if (c === '/' && n === '*') {
    const e = src.indexOf('*/', i + 2)

    return e === -1 ? src.length : e + 2
  }
  if (c === "'" || c === '"' || c === '`') {
    let j = i + 1
    while (j < src.length && src[j] !== c) {
      if (src[j] === '\\') j++
      j++
    }

    return j + 1
  }

  return i
}

// Given the index of an opening bracket, return the index of its matching closing bracket
function findClose(src, openIdx) {
  const open = src[openIdx]
  const close = { '{': '}', '[': ']', '(': ')' }[open]
  let depth = 0
  let i = openIdx

  while (i < src.length) {
    const j = skipLiteral(src, i)
    if (j !== i) {
      i = j
      continue
    }
    if (src[i] === open) depth++
    else if (src[i] === close) {
      depth--
      if (depth === 0) return i
    }
    i++
  }

  return -1
}

// Remove src[start..end) plus the rest of that line and any blank lines right after it
function cutBlock(src, start, end) {
  let after = src.slice(end)
  after = after.replace(/^[ \t]*;?[ \t]*\r?\n/, '') // rest of the line
  after = after.replace(/^(?:[ \t]*\r?\n)+/, '') // blank lines that follow

  return src.slice(0, start) + after
}

/* ---------------------------- steps ---------------------------- */

function removeImport(src) {
  return src.replace(IMPORT_RE, '')
}

function removeOnWorkFlow(src) {
  const patterns = [
    /^[ \t]*(?:const|let|var)\s+onWorkFlow\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>\s*\{/m,
    /^[ \t]*(?:async\s+)?function\s+onWorkFlow\s*\([^)]*\)\s*\{/m
  ]

  for (const re of patterns) {
    const m = re.exec(src)
    if (!m) continue

    const openIdx = m.index + m[0].length - 1
    const closeIdx = findClose(src, openIdx)
    if (closeIdx === -1) continue

    return { src: cutBlock(src, m.index, closeIdx + 1), removed: true }
  }

  return { src, removed: false }
}

function removeWorkFlowAction(src) {
  const m = /^([ \t]*)const\s+actions\s*=\s*\[/m.exec(src)
  if (!m) return { src, removed: false, actionsRemoved: false }

  const openIdx = m.index + m[0].length - 1
  const closeIdx = findClose(src, openIdx)
  if (closeIdx === -1) return { src, removed: false, actionsRemoved: false }

  // collect top-level objects of the array
  const body = src.slice(openIdx + 1, closeIdx)
  const objects = []
  let i = 0

  while (i < body.length) {
    const j = skipLiteral(body, i)
    if (j !== i) {
      i = j
      continue
    }
    if (body[i] === '{') {
      const e = findClose(body, i)
      if (e === -1) break
      objects.push(body.slice(i, e + 1))
      i = e + 1
      continue
    }
    i++
  }

  const isWorkFlow = text => /key\s*:\s*['"]WorkFlow['"]/.test(text) || /\bonWorkFlow\b/.test(text)
  const remaining = objects.filter(o => !isWorkFlow(o))

  if (remaining.length === objects.length) return { src, removed: false, actionsRemoved: false }

  // nothing left -> remove whole actions array and its usage
  if (remaining.length === 0) {
    let out = cutBlock(src, m.index, closeIdx + 1)
    out = out.replace(/^[ \t]*actions=\{actions\}[ \t]*\r?\n/m, '')
    out = out.replace(/[ \t]+actions=\{actions\}/, '')

    return { src: out, removed: true, actionsRemoved: true }
  }

  // otherwise rebuild the array without the WorkFlow action
  const firstObjIdx = body.indexOf('{')
  const lineStart = body.lastIndexOf('\n', firstObjIdx) + 1
  const itemIndent = body.slice(lineStart, firstObjIdx)
  const newArray = '[\n' + itemIndent + remaining.join(',\n' + itemIndent) + '\n' + m[1] + ']'

  return {
    src: src.slice(0, openIdx) + newArray + src.slice(closeIdx + 1),
    removed: true,
    actionsRemoved: false
  }
}

/* ---------------------------- file processing ---------------------------- */

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8')
  if (!IMPORT_RE.test(original)) return null

  let src = original

  // order matters: actions first (they reference onWorkFlow), then the function, then the import
  const act = removeWorkFlowAction(src)
  src = act.src

  const fn = removeOnWorkFlow(src)
  src = fn.src

  src = removeImport(src)

  const warnings = []
  if (/\bonWorkFlow\b/.test(src)) warnings.push('onWorkFlow is still referenced somewhere')
  if (/<WorkFlow\b|Component:\s*WorkFlow\b/.test(src)) warnings.push('WorkFlow component is still used somewhere')
  if (act.actionsRemoved && /\bactions\b/.test(src)) warnings.push('"actions" still appears in the file, check manually')

  if (!DRY && src !== original) fs.writeFileSync(file, src, 'utf8')

  return {
    file,
    actionRemoved: act.removed,
    actionsArrayRemoved: act.actionsRemoved,
    functionRemoved: fn.removed,
    warnings
  }
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), results)
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      results.push(path.join(dir, entry.name))
    }
  }

  return results
}

/* ---------------------------- main ---------------------------- */

const changed = []
for (const file of walk(ROOT)) {
  try {
    const r = processFile(file)
    if (r) changed.push(r)
  } catch (e) {
    console.error(`! Failed on ${file}: ${e.message}`)
  }
}

console.log(`${DRY ? '[DRY RUN] ' : ''}Scanned: ${ROOT}`)
console.log(`Files with the WorkFlow import: ${changed.length}\n`)

for (const r of changed) {
  console.log(path.relative(ROOT, r.file))
  console.log(`   import removed            : yes`)
  console.log(`   onWorkFlow function       : ${r.functionRemoved ? 'removed' : 'not found'}`)
  console.log(
    `   WorkFlow action           : ${
      r.actionRemoved ? (r.actionsArrayRemoved ? 'removed (whole actions array + usage removed)' : 'removed') : 'not found'
    }`
  )
  r.warnings.forEach(w => console.log(`   WARNING: ${w}`))
}
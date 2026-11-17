/**
 * add-table-refetch.cjs
 *
 * Scans every screen under packages/module-* (except module-remittance and module-ct),
 * finds <Table ... /> elements that use pagination (paginationType / paginationParameters)
 * but do NOT receive a `refetch` prop, and adds `refetch={refetch}` to them.
 * It also makes sure `refetch` is destructured from `useResourceQuery(...)`.
 *
 * Usage (from the repo root):
 *   node scripts/add-table-refetch.cjs            -> dry run (only reports, changes nothing)
 *   node scripts/add-table-refetch.cjs --write    -> applies the changes
 *
 * Optional:
 *   --exclude=module-x,module-y       additional modules to exclude
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PACKAGES_DIR = path.join(ROOT, 'packages')
const EXCLUDED_MODULES = new Set(['module-remittance', 'module-ct'])
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build'])

const WRITE = process.argv.includes('--write')

const extraExclude = process.argv.find(a => a.startsWith('--exclude='))
if (extraExclude) {
  extraExclude
    .split('=')[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(m => EXCLUDED_MODULES.add(m))
}

/* ------------------------------ file walking ------------------------------ */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(path.join(dir, entry.name), out)
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function collectFiles() {
  const files = []
  for (const entry of fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!entry.name.startsWith('module-')) continue
    if (EXCLUDED_MODULES.has(entry.name)) continue
    walk(path.join(PACKAGES_DIR, entry.name), files)
  }
  return files
}

/* ------------------------------ JSX parsing ------------------------------- */

function skipString(src, i) {
  const quote = src[i]
  let j = i + 1
  while (j < src.length) {
    const c = src[j]
    if (c === '\\') {
      j += 2
      continue
    }
    if (c === quote) return j + 1
    if (quote !== '`' && c === '\n') return j // unterminated, bail out safely
    j++
  }
  return j
}

/** Returns [{ start, end }] for every <Table ...> opening tag (not children). */
function findTableTags(src) {
  const tags = []
  const re = /<Table(?=[\s/>])/g
  let m
  while ((m = re.exec(src))) {
    const start = m.index
    let i = start + '<Table'.length
    let depth = 0
    let end = -1
    while (i < src.length) {
      const c = src[i]
      if (c === "'" || c === '"' || c === '`') {
        i = skipString(src, i)
        continue
      }
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '>' && depth === 0) {
        end = i + 1
        break
      }
      i++
    }
    if (end > 0) {
      tags.push({ start, end })
      re.lastIndex = end
    }
  }
  return tags
}

const hasPagination = tag =>
  (/\bpaginationType\s*=/.test(tag) || /\bpaginationParameters\b/.test(tag)) &&
  !/\bpagination\s*=\s*\{\s*false\s*\}/.test(tag)

const hasRefetchProp = tag => /\brefetch\s*=/.test(tag)

function insertRefetchProp(tag, varName, eol) {
  const m =
    tag.match(/\bpaginationType\s*=\s*(\{[^}]*\}|'[^']*'|"[^"]*")/) ||
    tag.match(/\bpaginationParameters\s*=\s*\{[^}]*\}/)
  if (!m) return null

  const pos = m.index + m[0].length
  const prop = `refetch={${varName}}`
  const lineStart = tag.lastIndexOf('\n', m.index)

  // multi-line tag where the matched prop sits on its own line -> new line, same indent
  if (lineStart !== -1 && /^[ \t]*\r?\n/.test(tag.slice(pos))) {
    const indent = tag.slice(lineStart + 1).match(/^[ \t]*/)[0]
    return tag.slice(0, pos) + eol + indent + prop + tag.slice(pos)
  }

  // inline tag
  return tag.slice(0, pos) + ' ' + prop + tag.slice(pos)
}

/* --------------------------- useResourceQuery ----------------------------- */

/** Finds the `{ ... }` destructuring of `const { ... } = useResourceQuery(` */
function findQueryDestructure(src) {
  const m = /=\s*useResourceQuery\s*\(/.exec(src)
  if (!m) return null

  let i = m.index - 1
  while (i >= 0 && /\s/.test(src[i])) i--
  if (src[i] !== '}') return null

  const close = i
  let depth = 0
  for (; i >= 0; i--) {
    if (src[i] === '}') depth++
    else if (src[i] === '{') {
      depth--
      if (depth === 0) break
    }
  }
  if (i < 0) return null

  return { open: i, close, body: src.slice(i + 1, close) }
}

function getRefetchVarName(body) {
  const m = /(?:^|[,{\s])refetch\b(?:\s*:\s*([\w$]+))?/.exec(body)
  if (!m) return null
  return m[1] || 'refetch'
}

function addRefetchToDestructure(src) {
  const d = findQueryDestructure(src)
  if (!d) return src

  const { body } = d
  const trimmed = body.replace(/\s+$/, '')
  const tail = body.slice(trimmed.length)
  const withoutComma = trimmed.replace(/,$/, '')

  let newBody
  if (body.includes('\n')) {
    const firstLine = body.split('\n').find(l => l.trim())
    const indent = firstLine ? firstLine.match(/^[ \t]*/)[0] : '    '
    const eol = body.includes('\r\n') ? '\r\n' : '\n'
    newBody = withoutComma + ',' + eol + indent + 'refetch' + tail
  } else {
    newBody = withoutComma + ', refetch' + tail
  }

  return src.slice(0, d.open + 1) + newBody + src.slice(d.close)
}

/* ------------------------------- processing ------------------------------- */

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8')
  if (!original.includes('<Table')) return null

  const eol = original.includes('\r\n') ? '\r\n' : '\n'
  const tags = findTableTags(original)
  const targets = tags.filter(t => {
    const tag = original.slice(t.start, t.end)
    return hasPagination(tag) && !hasRefetchProp(tag)
  })
  if (!targets.length) return null

  const destructure = findQueryDestructure(original)
  if (!destructure) return { file, status: 'manual', reason: 'no useResourceQuery destructuring found' }

  const existing = getRefetchVarName(destructure.body)
  const varName = existing || 'refetch'

  let updated = original
  let count = 0
  for (const t of [...targets].reverse()) {
    const tag = updated.slice(t.start, t.end)
    const newTag = insertRefetchProp(tag, varName, eol)
    if (!newTag) continue
    updated = updated.slice(0, t.start) + newTag + updated.slice(t.end)
    count++
  }

  if (!count) return { file, status: 'manual', reason: 'could not locate pagination prop to anchor the insert' }

  const addedToDestructure = !existing
  if (addedToDestructure) updated = addRefetchToDestructure(updated)

  if (WRITE) fs.writeFileSync(file, updated, 'utf8')
  return { file, status: 'updated', count, addedToDestructure }
}

/* ---------------------------------- main ---------------------------------- */

function main() {
  if (!fs.existsSync(PACKAGES_DIR)) {
    console.error(`packages folder not found at ${PACKAGES_DIR}. The scripts/ folder must live at the repo root.`)
    process.exit(1)
  }

  const files = collectFiles()
  const results = []
  for (const f of files) {
    try {
      const r = processFile(f)
      if (r) results.push(r)
    } catch (e) {
      results.push({ file: f, status: 'error', reason: e.message })
    }
  }

  const rel = f => path.relative(ROOT, f)
  const updated = results.filter(r => r.status === 'updated')
  const manual = results.filter(r => r.status === 'manual')
  const errors = results.filter(r => r.status === 'error')

  console.log(`\nMode: ${WRITE ? 'WRITE (files changed)' : 'DRY RUN (no files changed, use --write to apply)'}`)
  console.log(`Scanned ${files.length} files (excluded: ${[...EXCLUDED_MODULES].join(', ')})\n`)

  if (updated.length) {
    console.log(`${WRITE ? 'Updated' : 'Would update'} (${updated.length}):`)
    updated.forEach(r =>
      console.log(
        `  + ${rel(r.file)}  [${r.count} table(s)${r.addedToDestructure ? ', added refetch to useResourceQuery' : ''}]`
      )
    )
  }

  if (manual.length) {
    console.log(`\nNeeds manual review (${manual.length}):`)
    manual.forEach(r => console.log(`  ! ${rel(r.file)}  -> ${r.reason}`))
  }

  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach(r => console.log(`  x ${rel(r.file)}  -> ${r.reason}`))
  }

  if (!results.length) console.log('Nothing to change. All paginated tables already have refetch.')
  console.log('')
}

main()
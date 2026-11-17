const fs = require('fs')
const path = require('path')

const WRITE = process.argv.includes('--write')
const IGNORE = new Set(['node_modules', '.next', 'dist', 'build', '.git'])
const EXT = new Set(['.js', '.jsx'])

// Wrapper components we are allowed to climb through to reach the list page (e.g. JobOrderWindow)
const WRAPPER_RE = /Window/i

const FILES = [
  'packages/module-delivery/src/pages/delivery-orders/Forms/DeliveryOrdersForm.js',
  'packages/module-fa/src/pages/md-asset-depreciation/form/AssetsForm.js',
  'packages/module-financials/src/pages/ca-adjustment/form/CAadjustmentForms.js',
  'packages/module-financials/src/pages/fi-balance-tfr/forms/BalanceTransferBetweenAccForm.js',
  'packages/module-financials/src/pages/fi-balance-tfr-multi/Forms/BalanceTransferMultiForm.js',
  'packages/module-financials/src/pages/fi-balance-tfr-trx/[functionId]/forms/BalanceTransferForm.js',
  'packages/module-financials/src/pages/fi-cash-tfr/Forms/CashTransfersForm.js',
  'packages/module-financials/src/pages/fi-metal-trx/[functionId]/form/MetalTrxFinancialForm.js',
  'packages/module-financials/src/pages/fi-payment-vouchers/forms/FiPaymentVouchersForm.js',
  'packages/module-financials/src/pages/fi-pv-expenses/forms/PaymentVoucherExpensesForm.js',
  'packages/module-financials/src/pages/journal-vouchers/forms/JournalVoucherForm.js',
  'packages/module-financials/src/pages/memos/[functionId]/MemosForm.js',
  'packages/module-hr/src/pages/hr-balance-adjustment/forms/BalanceAdjustmentForm.js',
  'packages/module-hr/src/pages/hr-earned-leaves/Forms/EarnedLeavesForm.js',
  'packages/module-hr/src/pages/hr-leave-pay/Forms/LeavePaymentForm.js',
  'packages/module-inventory/src/pages/draft-serials-transfer/forms/DraftTransfer.js',
  'packages/module-inventory/src/pages/iv-adj-item-cost/Forms/AdjustItemCostForm.js',
  'packages/module-inventory/src/pages/materials-adjustment/Forms/MaterialsAdjustmentForm.js',
  'packages/module-manufacturing/src/pages/damage-return/forms/DamageReturnForm.js',
  'packages/module-manufacturing/src/pages/fo-castings/form/CastingForm.js',
  'packages/module-manufacturing/src/pages/fo-cutting/Form/CuttingForm.js',
  'packages/module-manufacturing/src/pages/fo-metal-trx/[functionId]/Forms/FOMetalTrxForm.js',
  'packages/module-manufacturing/src/pages/fo-purity-adj/form/PurityAdjForm.js',
  'packages/module-manufacturing/src/pages/fo-wax/form/FoWaxesForm.js',
  'packages/module-manufacturing/src/pages/mf-assemblies/forms/AssemblyForm.js',
  'packages/module-manufacturing/src/pages/mf-batch-transfer/Forms/BatchTransferForm.js',
  'packages/module-manufacturing/src/pages/mf-batch-worksheet/Forms/MainForm.js',
  'packages/module-manufacturing/src/pages/mf-item-disposal/Forms/ItemDisposalForm.js',
  'packages/module-manufacturing/src/pages/mf-jo-wizard/Forms/JobOrderWizardForm.js',
  'packages/module-manufacturing/src/pages/mf-prod-request/Forms/ProductionRequestForm.js',
  'packages/module-manufacturing/src/pages/mf-prod-sheet/Forms/ProductionSheetForm.js',
  'packages/module-manufacturing/src/pages/mf-prod-summary/Forms/ProductionSummaryForm.js',
  'packages/module-manufacturing/src/pages/pm-casting/Forms/CastingForm.js',
  'packages/module-manufacturing/src/pages/pm-rubber/Forms/RubberForm.js',
  'packages/module-purchase/src/pages/pu-draft-serials-returns/forms/PUDraftReturnForm.js',
  'packages/module-purchase/src/pages/shipments/forms/ShipmentsForm.js',
  'packages/module-rs/src/pages/work-order/forms/WorkOrderForm.js',
  'packages/module-sales/src/pages/return-on-invoice/forms/ReturnOnInvoiceForm.js',
  'packages/module-sales/src/pages/sa-plu/Forms/PriceListUpdateForm.js',
  'packages/shared-ui/src/components/Shared/Forms/FIReceiptVoucherForm.js',
  'packages/shared-ui/src/components/Shared/Forms/FixingForm.js',
  'packages/shared-ui/src/components/Shared/Forms/JTCheckoutForm.js',
  'packages/shared-ui/src/components/Shared/Forms/MaterialsTransferForm.js',
  'packages/shared-ui/src/components/Shared/Forms/ModellingForm.js',
  'packages/shared-ui/src/components/Shared/Forms/PayrollListForm.js',
  'packages/shared-ui/src/components/Shared/Forms/ProductionOrderForm.js',
  'packages/shared-ui/src/components/Shared/Forms/SamplesForm.js',
  'packages/shared-ui/src/components/Shared/Forms/SketchForm.js',
  'packages/shared-ui/src/components/Shared/Forms/StandardCostUpdateForm.js',
  'packages/shared-ui/src/components/Shared/Forms/TRXForm.js',
  'packages/shared-ui/src/components/Shared/Forms/ThreeDDesignForm.js',
  'packages/shared-ui/src/components/Shared/Forms/ThreeDPrintForm.js',
  'packages/shared-ui/src/components/Shared/Forms/WCConsumpForm.js',
  'packages/shared-ui/src/components/Shared/Forms/WorksheetForm.js',
  'packages/shared-ui/src/components/Shared/LeaveForm.js',
  'packages/shared-ui/src/components/Shared/PurchaseTransactionForm.js'
]

// Per-form overrides when auto-detection is wrong, e.g.
// 'packages/.../MemosForm.js': { resourceId: 'ResourceIds.Memos', recordId: 'recordId' }
const OVERRIDES = {}

const HOOK_IMPORT = "import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'"
const RESOURCEIDS_IMPORT = "import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'"

const FN_RE =
  /(async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{|(?:const|let)\s+(\w+)\s*=\s*(async\s+)?(?:\(([^)]*)\)|(\w+))\s*=>\s*\{/

/* ------------------------------ file cache ------------------------------ */

const contents = new Map()
const original = new Map()

function read(f) {
  if (!contents.has(f)) {
    const s = fs.readFileSync(f, 'utf8')
    contents.set(f, s)
    original.set(f, s)
  }
  return contents.get(f)
}

function set(f, s) {
  contents.set(f, s)
}

const allFiles = []

function walkDir(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name)) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walkDir(full)
    else if (EXT.has(path.extname(e.name))) allFiles.push(path.normalize(full))
  }
}

walkDir('packages')

/* ------------------------------ helpers ------------------------------ */

function addImport(src, line) {
  if (src.includes(line)) return src
  const re = /^import[\s\S]*?from\s+['"][^'"]+['"]\s*;?[ \t]*$/gm
  let end = -1
  let m
  while ((m = re.exec(src))) end = m.index + m[0].length
  if (end === -1) return null
  return src.slice(0, end) + '\n' + line + src.slice(end)
}

function detectResourceId(src) {
  const hook = src.match(/useRecordLock\(\{[\s\S]*?resourceId:\s*([^\n]+?)\s*,?\s*\n/)
  if (hook) return hook[1].trim()
  const shell = src.match(/<FormShell[\s\S]*?resourceId=\{([^}\n]+)\}/)
  return shell ? shell[1].trim() : null
}

const SKIP_IDS = new Set(['formik', 'store', 'true', 'false', 'null', 'undefined', 'ROW'])

// inline the `const x = ...` definitions of every flag used in the expression
function expandIds(src, expr, depth = 0) {
  return expr.replace(/(?<![.\w$])[A-Za-z_$][\w$]*/g, id => {
    if (id === 'editMode') return 'true' // list pages only open existing records
    if (SKIP_IDS.has(id) || depth > 3) return id
    const d = src.match(new RegExp('^[ \\t]*const\\s+' + id + '\\s*=\\s*([^\\n]+?);?[ \\t]*$', 'm'))
    return d ? `(${expandIds(src, d[1], depth + 1)})` : id
  })
}

// store.isPosted -> whatever the form puts in setStore({ isPosted: X.status == 3 })
function storeExpr(src, key) {
  const re = new RegExp('\\b' + key + '\\s*:\\s*([^,\\n}]+)', 'g')
  let m
  while ((m = re.exec(src))) {
    if (!/(===?|!==?|[<>])/.test(m[1])) continue
    return m[1]
      .trim()
      .replace(
        /[A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*?\??\.(\w+)(?=\s*(?:===?|!==?|[<>]))/g,
        'ROW.$1'
      )
  }
  return null
}

// constant folding for && / || once editMode became `true`
function fold(t) {
  t = t.trim()
  let prev
  do {
    prev = t
    t = t
      .replace(/!\s*true\b/g, 'false')
      .replace(/!\s*false\b/g, 'true')
      .replace(/\(\s*(true|false|ROW\.\w+\s*[=!<>]+\s*-?\d+|!?ROW\.\w+)\s*\)/g, '$1')
  } while (t !== prev)

  if (/[()]/.test(t)) return t

  const ors = t.split('||').map(o => {
    const ands = o.split('&&').map(s => s.trim()).filter(a => a !== 'true')
    if (ands.includes('false')) return 'false'
    return ands.length ? ands.join(' && ') : 'true'
  })
  if (ors.includes('true')) return 'true'
  const rest = ors.filter(o => o !== 'false')
  return rest.length ? rest.join(' || ') : 'false'
}

function resolveTerm(src, raw, verify) {
  let t = expandIds(src, raw)

  t = t.replace(/\bstore\??\.(\w+)/g, (all, k) => {
    const r = storeExpr(src, k)
    if (!r) return all
    verify.add(`\`store.${k}\` was taken from \`${k}: ...\` in the form - check it matches the list row`)
    return `(${r})`
  })

  t = t
    .replace(/formik\??\.values\??\.(\w+)\??\.(?=\w)/g, (all, k) => {
      if (new RegExp('\\b' + k + '\\s*:\\s*\\{').test(src)) {
        if (k !== 'header') verify.add(`assumes the list row exposes the \`${k}\` fields directly (e.g. row.${k}Field)`)
        return 'ROW.'
      }
      return `ROW.${k}.`
    })
    .replace(/formik\??\.values\??\./g, 'ROW.')
    .replace(/!==/g, '!=')
    .replace(/===/g, '==')

  t = fold(t)
  if (t === 'false') return { kind: 'false' }
  if (t === 'true') return { kind: 'true' }

  const leftover = t.replace(/ROW\.\w+/g, '').replace(/\b(true|false)\b/g, '')
  if (!/^[\s=!<>|&()\d.\-]*$/.test(leftover)) return { kind: 'unresolved' }
  return { kind: 'ok', expr: t }
}

// Finds the condition that makes the form read-only, as a template over the grid row:
// "ROW.status == -1 || ROW.status == 3"
function detectDisabled(src) {
  const candidates = []
  const ds = src.match(/disabledSubmit=\{([^{}\n]+)\}/)
  if (ds) candidates.push(ds[1].trim())

  const counts = {}
  const re = /readOnly=\{([^{}\n]+)\}/g
  let m
  while ((m = re.exec(src))) {
    const e = m[1].trim()
    if (e !== 'true' && e !== 'false') counts[e] = (counts[e] || 0) + 1
  }
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([e]) => !candidates.includes(e) && candidates.push(e))

  if (/^\s*const\s+isPosted\s*=/m.test(src) && !candidates.includes('isPosted')) candidates.push('isPosted')

  const notes = []

  for (const cand of candidates) {
    const verify = new Set()
    const kept = []
     const keptSrc = []
    const dropped = []
    let alwaysTrue = false
    let allFalse = true

    for (const term of cand.split('||').map(s => s.trim())) {
      const r = resolveTerm(src, term, verify)
      if (r.kind === 'ok') {
        allFalse = false
        if (!kept.includes(r.expr)) kept.push(r.expr)
          keptSrc.push(term)
      } else if (r.kind === 'unresolved') {
        allFalse = false
        dropped.push(term)
      } else if (r.kind === 'true') alwaysTrue = true
    }

    if (alwaysTrue) {
      notes.push(`\`${cand}\` is always true on an existing record, skipped`)
      continue
    }
    if (!kept.length) {
      notes.push(
        allFalse
          ? `\`${cand}\` is always false when a record exists (editMode), skipped`
          : `\`${cand}\` depends on state the list row does not have`
      )
      continue
    }

    dropped.forEach(d => verify.add(`ignored \`${d}\` (form state, not available on the list row)`))
    const template = kept.length > 1 ? kept.map(k => (/&&|\|\|/.test(k) ? `(${k})` : k)).join(' || ') : kept[0]
    return { source: cand, template, formExpr: keptSrc.join(' || '), warn: null, verify: [...verify] }
  }

  return { source: candidates[0] || null, template: null, formExpr: null, warn: notes.join('; ') || 'no read-only condition found in the form', verify: [] }
}

// split "a, b(c, d), e" on top-level commas only
function splitTop(s) {
  const out = []
  let depth = 0
  let cur = ''
  for (const c of s) {
    if ('([{'.includes(c)) depth++
    else if (')]}'.includes(c)) depth--
    if (c === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  if (cur.trim()) out.push(cur)
  return out
}

function stripExt(p) {
  return p.replace(/\.(js|jsx)$/, '')
}

function resolveSpec(fromFile, spec) {
  let p = null
  if (spec.startsWith('.')) p = path.join(path.dirname(fromFile), spec)
  else if (spec.startsWith('@argus/')) p = spec.replace('@argus/', 'packages/')
  return p ? stripExt(path.normalize(p)) : null
}

/* ------------------------------ form processing ------------------------------ */

function processForm(file) {
  const notes = []
  const manual = []

  if (!fs.existsSync(file)) return { status: 'MISSING', notes, manual, resourceId: null }

  let src = read(file)
  const ov = OVERRIDES[file] || {}
  const detected = ov.resourceId || detectResourceId(src)

  if (/useRecordLock/.test(src)) {
    return { status: 'SKIP', notes: ['already has useRecordLock'], manual, resourceId: detected }
  }

  const resourceId = detected
  const hasHeader = /\bheader:\s*\{/.test(src)
  const recordIsVar = /\(\s*\{[^)]*\brecordId\b[^)]*\}\s*\)/.test(src) || /\bconst\s+recordId\s*=/.test(src)
  const recordId =
    ov.recordId || (recordIsVar ? 'recordId' : hasHeader ? 'formik.values.header.recordId' : 'formik.values.recordId')
  const reference = ov.reference || (hasHeader ? 'formik?.values?.header?.reference' : 'formik?.values?.reference')

  const hasIsPosted = /^\s*const\s+isPosted\s*=/m.test(src)
  const info = detectDisabled(src)
  const fe = info.formExpr
  const wrapped = fe ? (/^[\w$.?]+$/.test(fe) ? fe : `(${fe})`) : null
  const enabled = wrapped
    ? `!!${recordId} && !${wrapped}`
    : hasIsPosted
    ? `!!${recordId} && !isPosted`
    : `!!${recordId}`

  if (!resourceId) manual.push('resourceId not found in <FormShell> - set it in OVERRIDES')
  if (!fe && !hasIsPosted) manual.push('no read-only condition or `isPosted` found - enabled uses only recordId, check it')
  if (!fe && hasIsPosted) manual.push(`read-only condition not resolved (${info.warn}) - enabled falls back to !isPosted`)

  // 1. import
  const withImport = addImport(src, HOOK_IMPORT)
  if (withImport === null) manual.push('could not find imports')
  else {
    src = withImport
    notes.push('import added')
  }

  // place the hook after every flag that `enabled` uses, so nothing is read before it is defined
  const formIdx = src.search(/useForm\s*\(/)
  const usedIds = fe
    ? fe.match(/(?<![.\w$])[A-Za-z_$][\w$]*/g) || []
    : hasIsPosted
    ? ['isPosted']
    : []
  let am = null
  for (const id of new Set([...usedIds, 'editMode'])) {
    const mm = src.match(new RegExp('^([ \\t]*)const\\s+' + id + '\\s*=.*$', 'm'))
    if (mm && (!am || mm.index > am.index)) am = mm
  }

  if (!am || am.index < formIdx) {
    manual.push('could not find a safe place for the hook (isPosted/editMode after useForm)')
  } else {
    const indent = am[1]
    const hook =
      `\n\n${indent}const { releaseLock } = useRecordLock({\n` +
      `${indent}  recordId: ${recordId},\n` +
      `${indent}  reference: ${reference},\n` +
      `${indent}  resourceId: ${resourceId || 'TODO_RESOURCE_ID'},\n` +
      `${indent}  enabled: ${enabled}\n` +
      `${indent}})`
    const at = am.index + am[0].length
    src = src.slice(0, at) + hook + src.slice(at)
    notes.push('hook added')
  }

  // 3. releaseLock on post
  const pm = src.match(/^([ \t]*)toast\.success\(\s*platformLabels\.Posted\s*\)\s*;?[ \t]*$/m)
  if (!pm) {
    manual.push('no `toast.success(platformLabels.Posted)` found - add `await releaseLock()` in the post handler')
  } else {
    const at = pm.index + pm[0].length
    src = src.slice(0, at) + `\n${pm[1]}await releaseLock()` + src.slice(at)
    notes.push('releaseLock added to post (make sure that function is async)')
  }

  set(file, src)

  return { status: manual.length ? 'PARTIAL' : 'OK', notes, manual, resourceId }
}

/* ------------------------------ page discovery ------------------------------ */

function importersOf(target) {
  const targetNoExt = stripExt(path.normalize(target))
  const base = path.basename(targetNoExt)
  const out = []

  for (const f of allFiles) {
    if (f === path.normalize(target)) continue
    const s = read(f)
    if (!s.includes(base)) continue

    const re = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
    let m
    while ((m = re.exec(s))) {
      if (resolveSpec(f, m[2]) === targetNoExt) out.push({ file: f, localName: m[1] })
    }
  }
  return out
}

function findPages(file, depth = 0, seen = new Set()) {
  const pages = []
  const ignored = []
  seen.add(path.normalize(file))

  if (path.basename(file, path.extname(file)) === 'index') return { pages, ignored }

  for (const imp of importersOf(file)) {
    if (seen.has(imp.file)) continue
    const s = read(imp.file)
    const isPage = path.basename(imp.file) === 'index.js' || /useResourceQuery/.test(s)

    if (isPage) pages.push(imp)
    else if (depth < 2 && WRAPPER_RE.test(path.basename(imp.file))) {
      const up = findPages(imp.file, depth + 1, seen)
      pages.push(...up.pages)
      ignored.push(...up.ignored)
    } else ignored.push(imp.file)
  }
  return { pages, ignored }
}

/* ------------------------------ page processing ------------------------------ */

function processPage(pageFile, localName, resourceId, disabledInfo) {
  const notes = []
  const manual = []
  let src = read(pageFile)

  if (!resourceId) {
    manual.push('no resourceId detected from the form - fix the form first or use OVERRIDES')
    return { status: 'PARTIAL', notes, manual }
  }

  // identifiers used in the resourceId expression must exist in the page
  const builtins = new Set(['parseInt', 'Number', 'String', 'ResourceIds'])
  const ids = (resourceId.match(/[A-Za-z_$][\w$]*/g) || []).filter(i => !builtins.has(i))
  ids.forEach(i => {
    if (!new RegExp('\\b' + i + '\\b').test(src)) manual.push(`resourceId uses \`${i}\` which is not defined in this page`)
  })

  const compRe = new RegExp('Component:\\s*' + localName + '\\b', 'g')
  const edits = []
  const seenFns = new Set()
  let found = false
  let m

  while ((m = compRe.exec(src))) {
    found = true
    const idx = m.index
    const stackPos = src.lastIndexOf('stack(', idx)
    if (stackPos === -1) {
      manual.push('could not find the stack( call for the form')
      continue
    }

    const lineStart = src.lastIndexOf('\n', stackPos) + 1
    if (src.slice(lineStart, stackPos).trim() !== '') {
      manual.push('stack(...) is inline with other code - add checkLock manually')
      continue
    }
    const indent = src.slice(lineStart, stackPos)

    const head = src.slice(0, stackPos)
    const fnRe = new RegExp(FN_RE.source, 'g')
    let fn = null
    let mm
    while ((mm = fnRe.exec(head))) fn = mm
    if (!fn) {
      manual.push('could not find the function that opens the form')
      continue
    }
    if (seenFns.has(fn.index)) continue
    seenFns.add(fn.index)

    const name = fn[2] || fn[4]
    const isAsync = !!(fn[1] || fn[5])
    const params = (fn[3] ?? fn[6] ?? fn[7] ?? '').trim()
    const body = head.slice(fn.index + fn[0].length)

    if (/checkLock\s*\(/.test(body)) {
      notes.push(`${name}: already has checkLock`)
      continue
    }

    // recordId passed to the form
    let chunk = src.slice(idx)
    const closer = chunk.search(/\n[ \t]*\}\)/)
    if (closer !== -1) chunk = chunk.slice(0, closer)
    const rm = chunk.match(/props:\s*\{[\s\S]*?\brecordId\b(?:\s*:\s*([^,\n}]+))?/)
    const recordExpr = rm ? (rm[1] ? rm[1].trim() : 'recordId') : null

    if (!recordExpr || ['0', 'null', 'undefined'].includes(recordExpr)) {
      notes.push(`${name}: add-only call (no recordId), skipped`)
      continue
    }

        // disabled expression, derived from the form's read-only condition
    const paramNames = params
      .split(',')
      .map(p => p.trim().replace(/=.*$/, '').trim())
      .filter(Boolean)
    const tpl = disabledInfo?.template
    const why = disabledInfo?.warn ? ` (${disabledInfo.warn})` : ''
    let disabledExpr
    let todo = false

    if (paramNames.includes('disabled')) {
      disabledExpr = 'disabled'
      manual.push(
        `${name}: uses its \`disabled\` param - make sure every caller passes ` +
          (tpl ? `\`${tpl.replace(/ROW\./g, 'obj?.')}\`` : 'the form read-only condition' + why)
      )
    } else if (paramNames.length && /^\w+$/.test(paramNames[0]) && paramNames[0] !== 'recordId') {
      if (tpl) {
        disabledExpr = tpl.replace(/ROW\./g, `${paramNames[0]}?.`)
      } else {
        disabledExpr = `${paramNames[0]}?.status == 3`
        manual.push(`${name}: fell back to \`${disabledExpr}\`${why} - verify the posted condition`)
      }
    } else if (tpl) {
      // no row param: add a `disabled` param and pass it from every caller
      disabledExpr = 'disabled'

      if (fn[7] !== undefined) {
        manual.push(`${name}: single-arg arrow function - add a \`disabled\` param and pass it from callers manually`)
      } else {
        const closeAt = fn[0].lastIndexOf(')')
        edits.push({ pos: fn.index + closeAt, text: params ? ', disabled' : 'disabled' })
        notes.push(`${name}: added \`disabled\` param`)

        const paramCount = paramNames.length
        const callRe = new RegExp('\\b' + name + '\\s*\\(', 'g')
        const fnEnd = fn.index + fn[0].length
        let cm

        while ((cm = callRe.exec(src))) {
          if (cm.index >= fn.index && cm.index < fnEnd) continue // the definition itself

          const argsStart = cm.index + cm[0].length
          let depth = 1
          let i = argsStart
          while (i < src.length && depth) {
            if (src[i] === '(') depth++
            else if (src[i] === ')') depth--
            i++
          }
          const closePos = i - 1
          const args = splitTop(src.slice(argsStart, closePos))

          if (!args.length) {
            notes.push(`${name}: call without args left as is (add flow)`)
            continue
          }

          const rm = args[0].match(/^\s*(\w+)\??\.recordId\s*$/)
          if (!rm || args.length !== paramCount) {
            manual.push(`${name}: could not patch call \`${name}(${args.join(',').trim()})\` - pass \`disabled\` manually`)
            continue
          }

          edits.push({ pos: closePos, text: ', ' + tpl.replace(/ROW\./g, rm[1] + '?.') })
          notes.push(`${name}: caller now passes ${tpl.replace(/ROW\./g, rm[1] + '?.')}`)
        }
      }
    } else {
      disabledExpr = 'false'
      todo = true
      manual.push(`${name}: could not derive the disabled condition${why} - set it manually`)
    }

    if (tpl && disabledInfo?.verify?.length) {
      disabledInfo.verify.forEach(v => manual.push(`${name}: ${v}`))
    }

    const idProp = recordExpr === 'recordId' ? 'recordId' : `recordId: ${recordExpr}`
    const block =
      `${indent}const canOpen = await checkLock({\n` +
      `${indent}  resourceId: ${resourceId},\n` +
      `${indent}  ${idProp},\n` +
      `${indent}  disabled: ${disabledExpr}${todo ? ' // TODO: posted condition' : ''}\n` +
      `${indent}})\n\n` +
      `${indent}if (!canOpen) return\n\n`

    edits.push({ pos: lineStart, text: block })
    notes.push(`${name}: checkLock added`)

    if (!isAsync) {
      if (fn[2]) edits.push({ pos: fn.index, text: 'async ' })
      else {
        const off = fn[0].match(/^(?:const|let)\s+\w+\s*=\s*/)[0].length
        edits.push({ pos: fn.index + off, text: 'async ' })
      }
      notes.push(`${name}: made async`)
    }
  }

  if (!found) {
    manual.push(`no stack({ Component: ${localName} }) found - check how the form is opened`)
    return { status: 'PARTIAL', notes, manual }
  }

  if (!edits.length) return { status: manual.length ? 'PARTIAL' : 'SKIP', notes, manual }

  edits.sort((a, b) => b.pos - a.pos)
  edits.forEach(e => (src = src.slice(0, e.pos) + e.text + src.slice(e.pos)))

  // hook declaration
  const hasCheckLockHook = /const\s*\{[^}]*\bcheckLock\b[^}]*\}\s*=\s*useRecordLock\(/.test(src)
  if (!hasCheckLockHook) {
    if (/useRecordLock\s*\(/.test(src)) {
      manual.push('useRecordLock already used in this page without checkLock - add it to the destructuring')
    } else {
      const wm = src.match(/^([ \t]*)const\s*\{[^}]*\bstack\b[^}]*\}\s*=\s*useWindow\(\)[^\n]*$/m)
      if (!wm) manual.push('could not find `const { stack } = useWindow()` - add `const { checkLock } = useRecordLock()` manually')
      else {
        const at = wm.index + wm[0].length
        src = src.slice(0, at) + `\n${wm[1]}const { checkLock } = useRecordLock()` + src.slice(at)
        notes.push('checkLock hook added')
      }
    }
  }

  // imports
  const i1 = addImport(src, HOOK_IMPORT)
  if (i1 === null) manual.push('could not add imports')
  else {
    if (i1 !== src) notes.push('useRecordLock import added')
    src = i1
    if (resourceId.includes('ResourceIds') && !/import[^;\n]*\bResourceIds\b/.test(src)) {
      const i2 = addImport(src, RESOURCEIDS_IMPORT)
      if (i2) {
        src = i2
        notes.push('ResourceIds import added')
      }
    }
  }

  set(pageFile, src)
  return { status: manual.length ? 'PARTIAL' : 'OK', notes, manual }
}

/* ------------------------------ main ------------------------------ */

const formSummary = {}
const pageSummary = {}
const bump = (obj, k) => (obj[k] = (obj[k] || 0) + 1)

for (const file of FILES) {
  const f = processForm(file)
  bump(formSummary, f.status)

  console.log(`\n[FORM ${f.status}] ${file}`)
  f.notes.forEach(n => console.log(`   + ${n}`))
  f.manual.forEach(n => console.log(`   ! ${n}`))

  if (f.status === 'MISSING') continue

    const disabledInfo = detectDisabled(read(file))
  console.log(
    disabledInfo.template
      ? `   ~ read-only when: ${disabledInfo.source}  ->  ${disabledInfo.template.replace(/ROW\./g, 'row.')}`
      : `   ~ read-only condition not resolved: ${disabledInfo.warn}`
  )
  ;(disabledInfo.verify || []).forEach(v => console.log(`   ~ ${v}`))

  const { pages, ignored } = findPages(file)

  if (!pages.length) console.log('   ? no list page found importing this form (or via a *Window wrapper)')
  if (pages.length > 1) console.log(`   ? ${pages.length} pages open this form - verify each one`)

  const done = new Set()
  for (const p of pages) {
    const key = p.file + '|' + p.localName
    if (done.has(key)) continue
    done.add(key)

    const r = processPage(p.file, p.localName, f.resourceId, disabledInfo)
    bump(pageSummary, r.status)
    console.log(`   [PAGE ${r.status}] ${p.file}  (opens <${p.localName}>)`)
    r.notes.forEach(n => console.log(`      + ${n}`))
    r.manual.forEach(n => console.log(`      ! ${n}`))
  }

  ignored.forEach(i => console.log(`   - ignored importer (not a list page): ${i}`))
}

let changed = 0
for (const [f, s] of contents) {
  if (s !== original.get(f)) {
    changed++
    if (WRITE) fs.writeFileSync(f, s, 'utf8')
  }
}

console.log('\n' + (WRITE ? `WROTE ${changed} file(s)` : `DRY RUN - ${changed} file(s) would change (pass --write to apply)`))
console.log('forms:', formSummary)
console.log('pages:', pageSummary)
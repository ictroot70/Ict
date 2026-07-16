import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

import ts from 'typescript'

const DETECTOR_VERSION = '2.0.0'
const CONTRACT_PATH = '.ai/contracts/product-requirements-lock.json'
const CACHE_PATH = '.ai/cache/runtime-hash.json'

const BASE_REF = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
const DIFF_FROM_REF = process.env.VERIFY_SMART_DIFF_FROM || ''
const DIFF_TO_REF = process.env.VERIFY_SMART_DIFF_TO || ''

const INFRA_TRIGGER_PATHS = new Set([
  '.ai/quality-gates.md',
  '.ai/policy.md',
  '.github/pull_request_template.md',
  'package.json',
  'pnpm-lock.yaml',
  'playwright.config.ts',
  'scripts/check-lighthouse-budgets.mjs',
  'scripts/check-product-contract.mjs',
  'scripts/verify-full-check.mjs',
  'scripts/detect-impact.mjs',
  'scripts/verify-smart-check.mjs',
])

const INFRA_TRIGGER_PREFIXES = ['.ai/playbooks/', 'tests/e2e/smoke/', 'tests/contracts/']

const TYPE_ONLY_DECLARATION_KINDS = new Set([
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.ImportType,
  ts.SyntaxKind.TypePredicate,
  ts.SyntaxKind.TypeParameter,
  ts.SyntaxKind.TypeLiteral,
  ts.SyntaxKind.TypeQuery,
  ts.SyntaxKind.TypeOperator,
  ts.SyntaxKind.IndexSignature,
  ts.SyntaxKind.CallSignature,
  ts.SyntaxKind.ConstructSignature,
  ts.SyntaxKind.MethodSignature,
  ts.SyntaxKind.PropertySignature,
])

const runtimeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'])

const cwd = process.cwd()
const normalizePath = value => value.replace(/\\/g, '/').replace(/^\.\//, '')

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function runGit(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8' })

  if (result.status !== 0) {
    if (allowFailure) {
      return null
    }

    throw new Error(result.stderr || `git ${args.join(' ')} failed`)
  }

  return result.stdout
}

function refExists(ref) {
  const result = spawnSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
    encoding: 'utf8',
  })

  return result.status === 0
}

function baseRefExists(baseRef) {
  return refExists(baseRef)
}

function parseNameStatus(output) {
  if (!output) {
    return []
  }

  const parts = output.split('\0').filter(Boolean)
  const entries = []

  for (let i = 0; i < parts.length; ) {
    const statusToken = parts[i++]
    const status = statusToken?.[0]

    if (!status) {
      continue
    }

    if (status === 'R' || status === 'C') {
      const oldPath = normalizePath(parts[i++] || '')
      const newPath = normalizePath(parts[i++] || '')

      entries.push({
        status,
        statusToken,
        oldPath,
        path: newPath,
      })
      continue
    }

    const filePath = normalizePath(parts[i++] || '')

    entries.push({
      status,
      statusToken,
      path: filePath,
    })
  }

  return entries
}

function readContract() {
  const fullPath = path.join(cwd, CONTRACT_PATH)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Contract file is missing: ${CONTRACT_PATH}`)
  }

  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  const protectedSet = new Set()
  const protectedItemsByPath = new Map()

  for (const group of parsed.groups || []) {
    for (const item of group.items || []) {
      if (item.status !== 'locked') {
        continue
      }

      const linkedPaths = [...(item.sourceFiles || []), ...(item.contractTests || [])]

      for (const linkedPath of linkedPaths) {
        const normalized = normalizePath(linkedPath)

        protectedSet.add(normalized)
        const existing = protectedItemsByPath.get(normalized) || new Set()

        existing.add(item.id)
        protectedItemsByPath.set(normalized, existing)
      }
    }
  }

  return { protectedSet, protectedItemsByPath }
}

function readCache() {
  const fullPath = path.join(cwd, CACHE_PATH)

  if (!fs.existsSync(fullPath)) {
    return {
      version: DETECTOR_VERSION,
      entries: {},
    }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))

    if (parsed.version !== DETECTOR_VERSION || typeof parsed.entries !== 'object' || !parsed.entries) {
      return {
        version: DETECTOR_VERSION,
        entries: {},
      }
    }

    return parsed
  } catch {
    return {
      version: DETECTOR_VERSION,
      entries: {},
    }
  }
}

function writeCache(cache) {
  const fullPath = path.join(cwd, CACHE_PATH)

  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
}

function isInfraTrigger(filePath) {
  if (INFRA_TRIGGER_PATHS.has(filePath)) {
    return true
  }

  return INFRA_TRIGGER_PREFIXES.some(prefix => filePath.startsWith(prefix))
}

function isRuntimeFile(filePath) {
  return runtimeExtensions.has(path.extname(filePath))
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath)

  switch (ext) {
    case '.tsx':
      return ts.ScriptKind.TSX
    case '.jsx':
      return ts.ScriptKind.JSX
    case '.js':
    case '.mjs':
    case '.cjs':
      return ts.ScriptKind.JS
    case '.ts':
    case '.mts':
    case '.cts':
    default:
      return ts.ScriptKind.TS
  }
}

function hasDeclareModifier(node) {
  return (
    Array.isArray(node.modifiers) &&
    node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword)
  )
}

function safeNodeText(node) {
  if (!node || typeof node.getText !== 'function') {
    return null
  }

  try {
    return node.getText()
  } catch {
    return null
  }
}

function serializeImportDeclaration(node) {
  const moduleName = node.moduleSpecifier?.text || safeNodeText(node.moduleSpecifier)

  if (!node.importClause) {
    return {
      kind: 'ImportDeclaration',
      moduleName,
      sideEffectOnly: true,
    }
  }

  if (node.importClause.isTypeOnly) {
    return null
  }

  const result = {
    kind: 'ImportDeclaration',
    moduleName,
  }

  if (node.importClause.name) {
    result.defaultBinding = node.importClause.name.text
  }

  const namedBindings = node.importClause.namedBindings

  if (namedBindings && ts.isNamespaceImport(namedBindings)) {
    result.namespaceBinding = namedBindings.name.text
  }

  if (namedBindings && ts.isNamedImports(namedBindings)) {
    const runtimeElements = namedBindings.elements
      .filter(element => !element.isTypeOnly)
      .map(element => ({
        imported: element.propertyName?.text || element.name.text,
        local: element.name.text,
      }))

    if (runtimeElements.length > 0) {
      result.namedBindings = runtimeElements
    }
  }

  const hasRuntimeBinding =
    Boolean(result.defaultBinding) || Boolean(result.namespaceBinding) || Array.isArray(result.namedBindings)

  if (!hasRuntimeBinding) {
    return null
  }

  return result
}

function serializeExportDeclaration(node) {
  if (node.isTypeOnly) {
    return null
  }

  const moduleName = node.moduleSpecifier?.text || safeNodeText(node.moduleSpecifier)

  if (!node.exportClause) {
    return {
      kind: 'ExportDeclaration',
      moduleName,
      starExport: true,
    }
  }

  if (ts.isNamespaceExport(node.exportClause)) {
    return {
      kind: 'ExportDeclaration',
      moduleName,
      namespaceExport: node.exportClause.name.text,
    }
  }

  if (ts.isNamedExports(node.exportClause)) {
    const runtimeSpecifiers = node.exportClause.elements
      .filter(element => !element.isTypeOnly)
      .map(element => ({
        exported: element.name.text,
        local: element.propertyName?.text || element.name.text,
      }))

    if (runtimeSpecifiers.length === 0) {
      return null
    }

    return {
      kind: 'ExportDeclaration',
      moduleName,
      namedExports: runtimeSpecifiers,
    }
  }

  return null
}

function extractMeta(node) {
  const meta = {}

  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) {
    meta.name = node.text
  }

  if (ts.isLiteralLikeNode(node)) {
    meta.literal = node.text
  }

  if (ts.isBinaryExpression(node)) {
    meta.operator = ts.SyntaxKind[node.operatorToken.kind]
  }

  if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
    meta.operator = ts.SyntaxKind[node.operator]
  }

  if (ts.isRegularExpressionLiteral(node)) {
    meta.regex = node.text
  }

  return Object.keys(meta).length > 0 ? meta : null
}

function serializeNode(node) {
  if (!node) {
    return null
  }

  if (hasDeclareModifier(node)) {
    return null
  }

  if (ts.isTypeNode(node)) {
    return null
  }

  if (TYPE_ONLY_DECLARATION_KINDS.has(node.kind)) {
    return null
  }

  if (
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    (typeof ts.isSatisfiesExpression === 'function' && ts.isSatisfiesExpression(node)) ||
    ts.isExpressionWithTypeArguments(node)
  ) {
    return serializeNode(node.expression)
  }

  if (ts.isImportDeclaration(node)) {
    return serializeImportDeclaration(node)
  }

  if (ts.isExportDeclaration(node)) {
    return serializeExportDeclaration(node)
  }

  if (ts.isImportSpecifier(node) && node.isTypeOnly) {
    return null
  }

  if (ts.isExportSpecifier(node) && node.isTypeOnly) {
    return null
  }

  if (ts.isImportClause(node) && node.isTypeOnly) {
    return null
  }

  if (ts.isHeritageClause(node)) {
    const runtimeTypes = node.types.map(item => serializeNode(item)).filter(Boolean)

    if (runtimeTypes.length === 0) {
      return null
    }

    return {
      kind: ts.SyntaxKind[node.kind],
      children: runtimeTypes,
    }
  }

  const result = {
    kind: ts.SyntaxKind[node.kind],
  }

  const meta = extractMeta(node)

  if (meta) {
    result.meta = meta
  }

  const children = []

  node.forEachChild(child => {
    const serialized = serializeNode(child)

    if (serialized) {
      children.push(serialized)
    }
  })

  if (children.length > 0) {
    result.children = children
  }

  return result
}

function runtimeFingerprint(source, filePath) {
  const scriptKind = getScriptKind(filePath)
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, false, scriptKind)

  const parseErrors = sourceFile.parseDiagnostics.filter(
    diagnostic => diagnostic.category === ts.DiagnosticCategory.Error
  )

  if (parseErrors.length > 0) {
    const firstError = parseErrors[0]
    const errorMessage = ts.flattenDiagnosticMessageText(firstError.messageText, '\n')

    throw new Error(`TypeScript AST parse failed: ${errorMessage}`)
  }

  const canonicalTree = serializeNode(sourceFile)

  return sha256(JSON.stringify(canonicalTree))
}

function getBaseBlob(baseRef, filePath) {
  const blobSha = runGit(['rev-parse', `${baseRef}:${filePath}`], { allowFailure: true })

  if (!blobSha) {
    return null
  }

  const content = runGit(['show', `${baseRef}:${filePath}`], { allowFailure: true })

  if (content === null) {
    return null
  }

  return {
    blobSha: blobSha.trim(),
    content,
  }
}

function getCachedOrComputeHash({ cache, filePath, blobSha, source }) {
  const key = `${filePath}|${blobSha}|${DETECTOR_VERSION}`

  if (cache.entries[key]) {
    return cache.entries[key]
  }

  const hash = runtimeFingerprint(source, filePath)

  cache.entries[key] = hash

  return hash
}

function collectChangedEntries(diffSpec) {
  const output = runGit(
    ['diff', '--name-status', '--find-renames', '--diff-filter=ACDMRTUXB', '-z', diffSpec],
    {
      allowFailure: true,
    }
  )

  if (output === null) {
    return null
  }

  return parseNameStatus(output)
}

function resolveDiffContext() {
  const diffFromRef = DIFF_FROM_REF.trim()
  const diffToRef = DIFF_TO_REF.trim()

  if (diffFromRef && diffToRef && refExists(diffFromRef) && refExists(diffToRef)) {
    return {
      mode: 'explicit_range',
      diffSpec: `${diffFromRef}..${diffToRef}`,
      comparisonBaseRef: diffFromRef,
      comparisonHeadRef: diffToRef,
      fallbackReason: null,
    }
  }

  if (!baseRefExists(BASE_REF)) {
    return null
  }

  return {
    mode: 'base_ref',
    diffSpec: `${BASE_REF}...HEAD`,
    comparisonBaseRef: BASE_REF,
    comparisonHeadRef: 'HEAD',
    fallbackReason:
      diffFromRef || diffToRef ? 'explicit_range_hint_invalid_fallback_to_base_ref' : null,
  }
}

function main() {
  const summary = {
    detectorVersion: DETECTOR_VERSION,
    baseRef: BASE_REF,
    diffFromRef: DIFF_FROM_REF || null,
    diffToRef: DIFF_TO_REF || null,
    diffMode: null,
    diffSpec: null,
    diffFallbackReason: null,
    comparisonBaseRef: null,
    comparisonHeadRef: null,
    decision: 'run_full',
    reasons: [],
    changedFiles: [],
    infraTriggers: [],
    protectedHits: [],
    protectedItems: [],
    uncertain: [],
  }

  try {
    const diffContext = resolveDiffContext()

    if (!diffContext) {
      summary.reasons.push('base_ref_unavailable')
      summary.uncertain.push(`Base ref not found: ${BASE_REF}`)
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    summary.diffMode = diffContext.mode
    summary.diffSpec = diffContext.diffSpec
    summary.diffFallbackReason = diffContext.fallbackReason
    summary.comparisonBaseRef = diffContext.comparisonBaseRef
    summary.comparisonHeadRef = diffContext.comparisonHeadRef

    const entries = collectChangedEntries(diffContext.diffSpec)

    if (entries === null) {
      summary.reasons.push('unable_to_collect_diff')
      summary.uncertain.push('git diff failed for smart detector')
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    const changedFiles = new Set()

    for (const entry of entries) {
      if (entry.path) {
        changedFiles.add(entry.path)
      }
      if (entry.oldPath) {
        changedFiles.add(entry.oldPath)
      }
    }

    summary.changedFiles = Array.from(changedFiles).sort()

    if (entries.length === 0) {
      summary.decision = 'skip_full'
      summary.reasons.push('no_changes_detected')
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    const { protectedSet, protectedItemsByPath } = readContract()

    const protectedChangedPaths = new Set()

    for (const entry of entries) {
      const isRenameOrCopy = entry.status === 'R' || entry.status === 'C'

      if (isRenameOrCopy) {
        summary.uncertain.push(`rename_or_copy_detected:${entry.oldPath}->${entry.path}`)
      }

      if (entry.status === 'D') {
        summary.uncertain.push(`deleted_file_detected:${entry.path}`)
      }

      if (['T', 'U', 'X', 'B'].includes(entry.status)) {
        summary.uncertain.push(`uncertain_status_${entry.status}:${entry.path}`)
      }

      const candidatePaths = [entry.path, entry.oldPath].filter(Boolean)

      for (const candidatePath of candidatePaths) {
        if (isInfraTrigger(candidatePath)) {
          summary.infraTriggers.push(candidatePath)
        }

        if (protectedSet.has(candidatePath)) {
          protectedChangedPaths.add(candidatePath)
          summary.protectedHits.push(candidatePath)

          const itemIds = Array.from(protectedItemsByPath.get(candidatePath) || []).sort()

          for (const itemId of itemIds) {
            summary.protectedItems.push({
              file: candidatePath,
              itemId,
            })
          }
        }
      }
    }

    summary.infraTriggers = Array.from(new Set(summary.infraTriggers)).sort()
    summary.protectedHits = Array.from(new Set(summary.protectedHits)).sort()
    summary.protectedItems = summary.protectedItems
      .sort((a, b) => `${a.itemId}:${a.file}`.localeCompare(`${b.itemId}:${b.file}`))
      .filter((value, index, arr) => {
        const previous = arr[index - 1]

        return !previous || previous.itemId !== value.itemId || previous.file !== value.file
      })

    if (summary.uncertain.length > 0) {
      summary.reasons.push('uncertain_change_detected')
      summary.decision = 'run_full'
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    const hasInfraTriggers = summary.infraTriggers.length > 0
    const hasProtectedHits = protectedChangedPaths.size > 0

    if (!hasInfraTriggers && !hasProtectedHits) {
      summary.decision = 'skip_full'
      summary.reasons.push('no_impact_on_protected_or_infra')
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    const cache = readCache()

    for (const filePath of protectedChangedPaths) {
      if (!isRuntimeFile(filePath)) {
        summary.reasons.push('protected_non_runtime_file_changed')
        summary.decision = 'run_full'
        console.log(JSON.stringify(summary, null, 2))

        return
      }

      const baseBlob = getBaseBlob(summary.comparisonBaseRef || BASE_REF, filePath)

      if (!baseBlob) {
        summary.reasons.push('protected_base_file_missing')
        summary.uncertain.push(`missing_base_blob:${filePath}`)
        summary.decision = 'run_full'
        console.log(JSON.stringify(summary, null, 2))

        return
      }

      const headBlob = getBaseBlob(summary.comparisonHeadRef || 'HEAD', filePath)

      if (!headBlob) {
        summary.reasons.push('protected_head_file_missing')
        summary.uncertain.push(`missing_head_blob:${filePath}`)
        summary.decision = 'run_full'
        console.log(JSON.stringify(summary, null, 2))

        return
      }

      let baseHash
      let headHash

      try {
        baseHash = getCachedOrComputeHash({
          cache,
          filePath,
          blobSha: baseBlob.blobSha,
          source: baseBlob.content,
        })
        headHash = getCachedOrComputeHash({
          cache,
          filePath,
          blobSha: headBlob.blobSha,
          source: headBlob.content,
        })
      } catch (error) {
        summary.reasons.push('ast_parse_error')
        summary.uncertain.push(
          `ast_compare_failed:${filePath}:${error instanceof Error ? error.message : String(error)}`
        )
        summary.decision = 'run_full'
        console.log(JSON.stringify(summary, null, 2))

        return
      }

      if (baseHash !== headHash) {
        summary.reasons.push('runtime_semantics_changed')
        summary.decision = 'run_full'
        writeCache(cache)
        console.log(JSON.stringify(summary, null, 2))

        return
      }
    }

    writeCache(cache)

    if (hasInfraTriggers) {
      summary.reasons.push('infra_trigger_changed')
      summary.decision = 'run_full'
      console.log(JSON.stringify(summary, null, 2))

      return
    }

    summary.decision = 'skip_full'
    summary.reasons.push('runtime_semantics_unchanged_for_protected_files')
    console.log(JSON.stringify(summary, null, 2))
  } catch (error) {
    summary.decision = 'run_full'
    summary.reasons.push('detector_exception')
    summary.uncertain.push(error instanceof Error ? error.message : String(error))
    console.log(JSON.stringify(summary, null, 2))
  }
}

main()

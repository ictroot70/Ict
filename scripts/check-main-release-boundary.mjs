import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const DEFAULT_ALLOW_LABEL = 'infra-exception'
const DEFAULT_BASE_REF = 'main'
const DEFAULT_HEAD_REF = 'HEAD'

const FORBIDDEN_RULES = [
  { id: '.ai/**', test: path => path.startsWith('.ai/') },
  { id: 'docs/**', test: path => path.startsWith('docs/') },
  { id: 'tests/contracts/**', test: path => path.startsWith('tests/contracts/') },
  { id: '.githooks/**', test: path => path.startsWith('.githooks/') },
  { id: 'scripts/check-*.mjs', test: path => /^scripts\/check-.*\.mjs$/.test(path) },
  { id: 'scripts/verify-*.mjs', test: path => /^scripts\/verify-.*\.mjs$/.test(path) },
]

function parseArgs(argv) {
  const parsed = {
    allowLabel: DEFAULT_ALLOW_LABEL,
    baseRef: '',
    headRef: '',
    labels: [],
  }

  for (const arg of argv) {
    if (arg.startsWith('--base=')) {
      parsed.baseRef = arg.slice('--base='.length).trim()
      continue
    }

    if (arg.startsWith('--head=')) {
      parsed.headRef = arg.slice('--head='.length).trim()
      continue
    }

    if (arg.startsWith('--labels=')) {
      parsed.labels = arg
        .slice('--labels='.length)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
      continue
    }

    if (arg.startsWith('--allow-label=')) {
      parsed.allowLabel = arg.slice('--allow-label='.length).trim() || DEFAULT_ALLOW_LABEL
    }
  }

  return parsed
}

function toAnnotationValue(value) {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
}

function annotate(level, message) {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    return
  }

  const safe = toAnnotationValue(message)

  console.log(`::${level} title=release-boundary::${safe}`)
}

function runGit(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })

  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(' ')} exited with code ${result.status}`)
  }

  return result.stdout.trim()
}

function resolveChangedFiles(baseRef, headRef) {
  const diffSpec = `${baseRef}...${headRef}`
  const output = runGit(['diff', '--name-only', '--diff-filter=ACDMRTUXB', diffSpec])

  if (!output) {
    return []
  }

  return output
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

function detectForbidden(changedFiles) {
  const forbidden = []

  for (const filePath of changedFiles) {
    for (const rule of FORBIDDEN_RULES) {
      if (rule.test(filePath)) {
        forbidden.push({ filePath, rule: rule.id })
        break
      }
    }
  }

  return forbidden
}

function readGitHubPrContext() {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
    return null
  }

  const eventPath = process.env.GITHUB_EVENT_PATH

  if (!eventPath || !fs.existsSync(eventPath)) {
    throw new Error('GITHUB_EVENT_PATH is missing for pull_request context')
  }

  const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const pullRequest = payload.pull_request

  if (!pullRequest) {
    throw new Error('pull_request payload is missing in GITHUB_EVENT_PATH file')
  }

  const labels = Array.isArray(pullRequest.labels)
    ? pullRequest.labels
        .map(item => item?.name)
        .filter(value => typeof value === 'string' && value.trim().length > 0)
    : []

  return {
    baseRef: pullRequest.base?.ref || '',
    baseSha: pullRequest.base?.sha || '',
    headSha: pullRequest.head?.sha || '',
    labels,
    number: pullRequest.number,
  }
}

function hasExceptionLabel(labels, allowLabel) {
  return labels.some(label => label === allowLabel)
}

function printForbiddenList(forbidden) {
  for (const item of forbidden) {
    console.log(`- ${item.filePath} (rule: ${item.rule})`)
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const prContext = readGitHubPrContext()
  const allowLabel =
    args.allowLabel || process.env.RELEASE_BOUNDARY_ALLOW_LABEL || DEFAULT_ALLOW_LABEL

  let baseRef = args.baseRef || process.env.RELEASE_BOUNDARY_BASE || DEFAULT_BASE_REF
  let headRef = args.headRef || process.env.RELEASE_BOUNDARY_HEAD || DEFAULT_HEAD_REF
  let labels = args.labels

  if (prContext) {
    if (prContext.baseRef !== 'main') {
      console.log(
        `[release-boundary] Skipped: PR #${prContext.number} targets "${prContext.baseRef}", only "main" is enforced.`
      )

      return
    }

    baseRef = prContext.baseSha
    headRef = prContext.headSha
    labels = prContext.labels
  }

  const changedFiles = resolveChangedFiles(baseRef, headRef)
  const forbidden = detectForbidden(changedFiles)

  if (forbidden.length === 0) {
    console.log(
      `[release-boundary] Passed: no forbidden technical paths in diff ${baseRef}...${headRef}.`
    )

    return
  }

  const hasBypass = hasExceptionLabel(labels, allowLabel)

  if (hasBypass) {
    const msg = `Bypass label "${allowLabel}" is present. Forbidden technical paths detected, but check is allowed.`

    console.log(`[release-boundary] ${msg}`)
    printForbiddenList(forbidden)
    annotate('warning', msg)

    return
  }

  const message =
    `Forbidden technical paths detected for release PR to main. ` +
    `Add label "${allowLabel}" only for approved infra exception.`

  console.error(`[release-boundary] ${message}`)
  printForbiddenList(forbidden)
  annotate('error', message)
  process.exit(1)
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)

  console.error(`[release-boundary] Failed: ${message}`)
  annotate('error', message)
  process.exit(1)
}

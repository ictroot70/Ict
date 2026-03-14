import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const STAMP_VERSION = 1
const STAMP_RELATIVE_PATH = path.join('codex', 'verification-stamp.json')

function runGit(args, { cwd = process.cwd(), allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    if (allowFailure) {
      return null
    }

    throw new Error(result.stderr || `git ${args.join(' ')} exited with code ${result.status}`)
  }

  return result.stdout.trim()
}

function resolveGitDir(cwd = process.cwd()) {
  const gitDir = runGit(['rev-parse', '--git-dir'], { cwd, allowFailure: true })

  if (!gitDir) {
    return null
  }

  return path.isAbsolute(gitDir) ? gitDir : path.join(cwd, gitDir)
}

export function getCurrentHeadSha(cwd = process.cwd()) {
  return runGit(['rev-parse', 'HEAD'], { cwd, allowFailure: true })
}

export function resolveRefSha(ref, cwd = process.cwd()) {
  if (!ref) {
    return null
  }

  return runGit(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
    cwd,
    allowFailure: true,
  })
}

export function readVerificationStamp(cwd = process.cwd()) {
  const gitDir = resolveGitDir(cwd)

  if (!gitDir) {
    return null
  }

  const filePath = path.join(gitDir, STAMP_RELATIVE_PATH)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    if (
      !parsed ||
      parsed.version !== STAMP_VERSION ||
      typeof parsed.headSha !== 'string' ||
      parsed.headSha.length < 7
    ) {
      return null
    }

    return {
      ...parsed,
      filePath,
    }
  } catch {
    return null
  }
}

export function writeVerificationStamp(
  {
    headSha,
    gate,
    decision,
    baseRef = null,
    baseRefSha = null,
    reason = null,
    ciCheck = null,
    fullCheck = null,
    branch = null,
    appBaseUrl = null,
  },
  cwd = process.cwd()
) {
  const gitDir = resolveGitDir(cwd)

  if (!gitDir) {
    return null
  }

  const resolvedHeadSha = headSha || getCurrentHeadSha(cwd)

  if (!resolvedHeadSha) {
    return null
  }

  const filePath = path.join(gitDir, STAMP_RELATIVE_PATH)

  const payload = {
    version: STAMP_VERSION,
    headSha: resolvedHeadSha,
    gate: gate || null,
    decision: decision || null,
    baseRef,
    baseRefSha,
    reason,
    ciCheck,
    fullCheck,
    branch,
    appBaseUrl,
    verifiedAt: new Date().toISOString(),
  }

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  } catch {
    return null
  }

  return {
    ...payload,
    filePath,
  }
}

export function shortSha(sha) {
  return typeof sha === 'string' ? sha.slice(0, 12) : ''
}

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const cwd = process.cwd()
const hooksPath = '.githooks'
const hookFiles = ['pre-commit', 'pre-push']

function runGit(args, { allowFailure = false } = {}) {
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

function isGitRepository() {
  const result = runGit(['rev-parse', '--is-inside-work-tree'], { allowFailure: true })

  return result === 'true'
}

function makeExecutable(filePath) {
  try {
    const stat = fs.statSync(filePath)
    const mode = stat.mode | 0o111

    fs.chmodSync(filePath, mode)
  } catch {
    // chmod can be ignored on non-posix filesystems
  }
}

function ensureHookFilesExist() {
  const missing = hookFiles.filter(file => !fs.existsSync(path.join(cwd, hooksPath, file)))

  if (missing.length > 0) {
    throw new Error(`Missing hook files: ${missing.join(', ')}`)
  }
}

function install() {
  if (!isGitRepository()) {
    console.log('[hooks:install] Not a git repository. Skipping hook installation.')

    return
  }

  ensureHookFilesExist()

  runGit(['config', '--local', 'core.hooksPath', hooksPath])

  for (const hookFile of hookFiles) {
    makeExecutable(path.join(cwd, hooksPath, hookFile))
  }

  const configuredPath = runGit(['config', '--local', '--get', 'core.hooksPath'], {
    allowFailure: true,
  })

  console.log(`[hooks:install] core.hooksPath=${configuredPath || hooksPath}`)
}

install()

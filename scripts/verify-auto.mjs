import { spawn, spawnSync } from 'node:child_process'

const BASE_REF = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
const FORCE_FULL = process.env.VERIFY_SMART_FORCE_FULL === '1'
const DRY_RUN = process.env.VERIFY_AUTO_DRY_RUN === '1'

function runCommandCapture(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    env,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || `${command} ${args.join(' ')} exited with code ${result.status}`)
  }

  return result.stdout.trim()
}

function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })
}

function detectBranchName() {
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME
  }

  const branch = runCommandCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

  return branch || 'unknown'
}

function baseRefExists(baseRef) {
  const result = spawnSync('git', ['rev-parse', '--verify', '--quiet', baseRef], {
    encoding: 'utf8',
  })

  return result.status === 0
}

function getChangedFiles(baseRef) {
  const result = spawnSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACDMRTUXB', baseRef],
    {
      encoding: 'utf8',
    }
  )

  if (result.status !== 0) {
    return null
  }

  return result.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function decidePlan({ branch, forceFull, changedFiles, baseRefAvailable }) {
  if (forceFull) {
    return {
      decision: 'run_full',
      command: 'verify:full',
      reason: 'forced_by_env',
    }
  }

  if (branch === 'develop') {
    return {
      decision: 'run_full',
      command: 'verify:full',
      reason: 'integration_branch_requires_full_check',
    }
  }

  if (!baseRefAvailable) {
    return {
      decision: 'run_smart',
      command: 'verify:smart',
      reason: 'base_ref_unavailable_fallback_to_smart',
    }
  }

  if (Array.isArray(changedFiles) && changedFiles.length === 0) {
    return {
      decision: 'skip',
      command: null,
      reason: 'no_changes_detected',
    }
  }

  return {
    decision: 'run_smart',
    command: 'verify:smart',
    reason: 'feature_or_pr_branch_policy',
  }
}

async function main() {
  const branch = detectBranchName()
  const baseRefAvailable = baseRefExists(BASE_REF)
  const changedFiles = baseRefAvailable ? getChangedFiles(BASE_REF) : null

  const plan = decidePlan({
    branch,
    forceFull: FORCE_FULL,
    changedFiles,
    baseRefAvailable,
  })

  const summary = {
    gate: 'verify:auto',
    branch,
    baseRef: BASE_REF,
    baseRefAvailable,
    forceFull: FORCE_FULL,
    dryRun: DRY_RUN,
    changedFilesCount: changedFiles?.length ?? null,
    changedFilesSample: (changedFiles || []).slice(0, 20),
    decision: plan.decision,
    command: plan.command,
    reason: plan.reason,
  }

  if (DRY_RUN || !plan.command) {
    summary.status = plan.command ? 'planned' : 'skipped'
    console.log(JSON.stringify(summary, null, 2))

    return
  }

  try {
    await runCommand('pnpm', ['run', plan.command])
    summary.status = 'passed'
    console.log(JSON.stringify(summary, null, 2))
  } catch (error) {
    summary.status = 'failed'
    summary.error = error instanceof Error ? error.message : String(error)
    console.log(JSON.stringify(summary, null, 2))
    throw error
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

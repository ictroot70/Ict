import { spawn } from 'node:child_process'
import { spawnSync } from 'node:child_process'

const FORCE_FULL = process.env.VERIFY_SMART_FORCE_FULL === '1'

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

function detectBranchName() {
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME
  }

  const branch = runCommandCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

  return branch || 'unknown'
}

function buildSummary({
  branch,
  ciCheck,
  detector,
  decision,
  fullCheck,
  reason,
  forceFull,
  baseRef,
}) {
  return {
    gate: 'verify:smart',
    branch,
    baseRef,
    forceFull,
    ciCheck,
    decision,
    fullCheck,
    reason,
    detector,
  }
}

async function run() {
  const branch = detectBranchName()
  const baseRef = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'

  await runCommand('pnpm', ['run', 'ci:check'])

  if (FORCE_FULL) {
    const summary = buildSummary({
      branch,
      ciCheck: 'passed',
      detector: null,
      decision: 'run_full',
      fullCheck: 'planned',
      reason: 'forced_by_env',
      forceFull: true,
      baseRef,
    })

    try {
      await runCommand('pnpm', ['run', 'verify:full'], {
        ...process.env,
        VERIFY_FULL_SKIP_CI: '1',
      })
      summary.fullCheck = 'executed'
    } catch (error) {
      summary.fullCheck = 'failed'
      summary.error = error instanceof Error ? error.message : String(error)
      console.log(JSON.stringify(summary, null, 2))
      throw error
    }

    console.log(JSON.stringify(summary, null, 2))

    return
  }

  if (branch === 'develop') {
    const summary = buildSummary({
      branch,
      ciCheck: 'passed',
      detector: null,
      decision: 'run_full',
      fullCheck: 'planned',
      reason: 'integration_branch_requires_full_check',
      forceFull: false,
      baseRef,
    })

    try {
      await runCommand('pnpm', ['run', 'verify:full'], {
        ...process.env,
        VERIFY_FULL_SKIP_CI: '1',
      })
      summary.fullCheck = 'executed'
    } catch (error) {
      summary.fullCheck = 'failed'
      summary.error = error instanceof Error ? error.message : String(error)
      console.log(JSON.stringify(summary, null, 2))
      throw error
    }

    console.log(JSON.stringify(summary, null, 2))

    return
  }

  const detectorRaw = runCommandCapture('node', ['scripts/detect-impact.mjs'], process.env)
  const detector = JSON.parse(detectorRaw)

  if (detector.decision === 'run_full') {
    const summary = buildSummary({
      branch,
      ciCheck: 'passed',
      detector,
      decision: 'run_full',
      fullCheck: 'planned',
      reason: 'detector_decision',
      forceFull: false,
      baseRef,
    })

    try {
      await runCommand('pnpm', ['run', 'verify:full'], {
        ...process.env,
        VERIFY_FULL_SKIP_CI: '1',
      })
      summary.fullCheck = 'executed'
    } catch (error) {
      summary.fullCheck = 'failed'
      summary.error = error instanceof Error ? error.message : String(error)
      console.log(JSON.stringify(summary, null, 2))
      throw error
    }

    console.log(JSON.stringify(summary, null, 2))

    return
  }

  const summary = buildSummary({
    branch,
    ciCheck: 'passed',
    detector,
    decision: 'skip_full',
    fullCheck: 'skipped',
    reason: 'detector_decision',
    forceFull: false,
    baseRef,
  })

  console.log(JSON.stringify(summary, null, 2))
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

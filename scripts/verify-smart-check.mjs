import { spawn } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import {
  getCurrentHeadSha,
  resolveRefSha,
  shortSha,
  writeVerificationStamp,
} from './lib/verification-stamp.mjs'

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
  diffFrom,
  diffTo,
}) {
  return {
    gate: 'verify:smart',
    branch,
    baseRef,
    diffFrom: diffFrom || null,
    diffTo: diffTo || null,
    forceFull,
    ciCheck,
    decision,
    fullCheck,
    reason,
    detector,
  }
}

function attachVerificationStamp({ summary, headSha, baseRefSha }) {
  const stamp = writeVerificationStamp({
    headSha,
    gate: 'verify:smart',
    decision: summary.decision,
    baseRef: summary.baseRef,
    baseRefSha,
    reason: summary.reason,
    ciCheck: summary.ciCheck,
    fullCheck: summary.fullCheck,
    branch: summary.branch,
  })

  if (!stamp) {
    return
  }

  summary.verificationStamp = {
    headSha: stamp.headSha,
    headShaShort: shortSha(stamp.headSha),
    gate: stamp.gate,
    decision: stamp.decision,
    fullCheck: stamp.fullCheck,
    verifiedAt: stamp.verifiedAt,
    filePath: stamp.filePath,
  }
}

async function run() {
  const branch = detectBranchName()
  const baseRef = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
  const diffFrom = process.env.VERIFY_SMART_DIFF_FROM || null
  const diffTo = process.env.VERIFY_SMART_DIFF_TO || null
  const baseRefSha = resolveRefSha(baseRef)
  const headSha = getCurrentHeadSha()

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
      diffFrom,
      diffTo,
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

    attachVerificationStamp({
      summary,
      headSha,
      baseRefSha,
    })
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
      diffFrom,
      diffTo,
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

    attachVerificationStamp({
      summary,
      headSha,
      baseRefSha,
    })
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
      diffFrom,
      diffTo,
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

    attachVerificationStamp({
      summary,
      headSha,
      baseRefSha,
    })
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
    diffFrom,
    diffTo,
  })

  attachVerificationStamp({
    summary,
    headSha,
    baseRefSha,
  })
  console.log(JSON.stringify(summary, null, 2))
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

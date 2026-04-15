import { spawn, spawnSync } from 'node:child_process'
import {
  getCurrentHeadSha,
  readVerificationStamp,
  resolveRefSha,
  shortSha,
} from './lib/verification-stamp.mjs'

const BASE_REF = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
const FORCE_FULL = process.env.VERIFY_SMART_FORCE_FULL === '1'
const DRY_RUN = process.env.VERIFY_AUTO_DRY_RUN === '1'
const IGNORE_STAMP = process.env.VERIFY_AUTO_IGNORE_STAMP === '1'
const LOCAL_SHA_HINT = process.env.VERIFY_AUTO_LOCAL_SHA || ''
const REMOTE_SHA_HINT = process.env.VERIFY_AUTO_REMOTE_SHA || ''

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

function refExists(ref) {
  if (!ref) {
    return false
  }

  const result = spawnSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
    encoding: 'utf8',
  })

  return result.status === 0
}

function isZeroSha(sha) {
  return typeof sha === 'string' && /^0+$/.test(sha)
}

function getChangedFilesByDiffSpec(diffSpec) {
  const result = spawnSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACDMRTUXB', diffSpec],
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

function resolveDiffInput({ baseRef, baseRefAvailable, localShaHint, remoteShaHint }) {
  const localSha = localShaHint.trim()
  const remoteSha = remoteShaHint.trim()

  if (localSha && refExists(localSha)) {
    if (remoteSha && !isZeroSha(remoteSha) && refExists(remoteSha)) {
      return {
        diffSpec: `${remoteSha}..${localSha}`,
        source: 'push_range',
        pushRangeHint: {
          localSha,
          remoteSha,
        },
      }
    }

    if (baseRefAvailable) {
      return {
        diffSpec: `${baseRef}...${localSha}`,
        source: 'base_ref_vs_local_head',
        fallbackReason: remoteSha
          ? 'remote_sha_unavailable_or_zero_fallback_to_base_ref'
          : 'remote_sha_missing_fallback_to_base_ref',
        pushRangeHint: {
          localSha,
          remoteSha: remoteSha || null,
        },
      }
    }
  }

  if (baseRefAvailable) {
    return {
      diffSpec: `${baseRef}...HEAD`,
      source: 'base_ref_vs_head',
      pushRangeHint: localSha
        ? {
            localSha,
            remoteSha: remoteSha || null,
          }
        : null,
    }
  }

  return {
    diffSpec: null,
    source: 'none',
    fallbackReason: 'base_ref_unavailable',
    pushRangeHint: localSha
      ? {
          localSha,
          remoteSha: remoteSha || null,
        }
      : null,
  }
}

function isFullVerificationStamp(stamp) {
  return stamp?.gate === 'verify:full' || stamp?.fullCheck === 'executed'
}

function canReuseVerification({
  stamp,
  planCommand,
  headSha,
  forceFull,
  ignoreStamp,
  baseRef,
  baseRefAvailable,
  currentBaseRefSha,
}) {
  if (ignoreStamp) {
    return {
      reusable: false,
      reason: 'stamp_ignored_by_env',
    }
  }

  if (forceFull) {
    return {
      reusable: false,
      reason: 'force_full_enabled',
    }
  }

  if (!planCommand) {
    return {
      reusable: false,
      reason: 'no_command_planned',
    }
  }

  if (!headSha) {
    return {
      reusable: false,
      reason: 'head_sha_unavailable',
    }
  }

  if (!stamp) {
    return {
      reusable: false,
      reason: 'stamp_missing',
    }
  }

  if (stamp.headSha !== headSha) {
    return {
      reusable: false,
      reason: 'stamp_head_mismatch',
    }
  }

  if (planCommand === 'verify:full') {
    if (isFullVerificationStamp(stamp)) {
      return {
        reusable: true,
        reason: 'full_verification_already_passed_for_head',
      }
    }

    return {
      reusable: false,
      reason: 'full_verification_required',
    }
  }

  if (planCommand === 'verify:smart') {
    if (isFullVerificationStamp(stamp)) {
      return {
        reusable: true,
        reason: 'full_verification_already_passed_for_head',
      }
    }

    if (stamp.gate !== 'verify:smart') {
      return {
        reusable: false,
        reason: 'smart_verification_stamp_missing',
      }
    }

    if (!baseRefAvailable) {
      return {
        reusable: false,
        reason: 'base_ref_unavailable_for_smart_stamp_validation',
      }
    }

    if (stamp.baseRef !== baseRef) {
      return {
        reusable: false,
        reason: 'smart_stamp_base_ref_mismatch',
      }
    }

    if (!stamp.baseRefSha || !currentBaseRefSha) {
      return {
        reusable: false,
        reason: 'smart_stamp_base_sha_unavailable',
      }
    }

    if (stamp.baseRefSha !== currentBaseRefSha) {
      return {
        reusable: false,
        reason: 'smart_stamp_base_sha_changed',
      }
    }

    return {
      reusable: true,
      reason: 'smart_verification_already_passed_for_head',
    }
  }

  return {
    reusable: false,
    reason: 'unsupported_plan_command',
  }
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
  const headSha = getCurrentHeadSha()
  const currentBaseRefSha = baseRefAvailable ? resolveRefSha(BASE_REF) : null
  const diffInput = resolveDiffInput({
    baseRef: BASE_REF,
    baseRefAvailable,
    localShaHint: LOCAL_SHA_HINT,
    remoteShaHint: REMOTE_SHA_HINT,
  })
  const changedFiles = diffInput.diffSpec ? getChangedFilesByDiffSpec(diffInput.diffSpec) : null

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
    ignoreStamp: IGNORE_STAMP,
    headSha: headSha || null,
    headShaShort: shortSha(headSha),
    baseRefSha: currentBaseRefSha || null,
    diffSource: diffInput.source,
    diffSpec: diffInput.diffSpec,
    diffFallbackReason: diffInput.fallbackReason || null,
    pushRangeHint: diffInput.pushRangeHint,
    changedFilesCount: changedFiles?.length ?? null,
    changedFilesSample: (changedFiles || []).slice(0, 20),
    decision: plan.decision,
    command: plan.command,
    reason: plan.reason,
  }

  const commandEnv = { ...process.env }

  if (
    plan.command === 'verify:smart' &&
    diffInput.source === 'push_range' &&
    diffInput.pushRangeHint?.localSha &&
    diffInput.pushRangeHint?.remoteSha &&
    !isZeroSha(diffInput.pushRangeHint.remoteSha)
  ) {
    commandEnv.VERIFY_SMART_DIFF_FROM = diffInput.pushRangeHint.remoteSha
    commandEnv.VERIFY_SMART_DIFF_TO = diffInput.pushRangeHint.localSha
    summary.smartDiffRange = {
      from: diffInput.pushRangeHint.remoteSha,
      to: diffInput.pushRangeHint.localSha,
      source: 'pre_push_range_hint',
    }
  }

  const stamp = readVerificationStamp()
  const reuse = canReuseVerification({
    stamp,
    planCommand: plan.command,
    headSha,
    forceFull: FORCE_FULL,
    ignoreStamp: IGNORE_STAMP,
    baseRef: BASE_REF,
    baseRefAvailable,
    currentBaseRefSha,
  })

  summary.stampCheck = {
    reusable: reuse.reusable,
    reason: reuse.reason,
    stampHeadSha: stamp?.headSha || null,
    stampHeadShaShort: shortSha(stamp?.headSha),
    stampGate: stamp?.gate || null,
    stampDecision: stamp?.decision || null,
    stampBaseRef: stamp?.baseRef || null,
    stampBaseRefSha: stamp?.baseRefSha || null,
    stampVerifiedAt: stamp?.verifiedAt || null,
    stampFilePath: stamp?.filePath || null,
  }

  if (reuse.reusable) {
    summary.status = 'reused'
    console.log(JSON.stringify(summary, null, 2))

    return
  }

  if (DRY_RUN || !plan.command) {
    summary.status = plan.command ? 'planned' : 'skipped'
    console.log(JSON.stringify(summary, null, 2))

    return
  }

  try {
    await runCommand('pnpm', ['run', plan.command], commandEnv)
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

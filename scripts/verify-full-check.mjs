import { spawn, spawnSync } from 'node:child_process'
import {
  getCurrentHeadSha,
  resolveRefSha,
  shortSha,
  writeVerificationStamp,
} from './lib/verification-stamp.mjs'

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://127.0.0.1:3000'
const SHOULD_SKIP_CI = process.env.VERIFY_FULL_SKIP_CI === '1'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

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

async function waitForServer(url, getServerState) {
  const timeoutMs = 120000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const serverState = getServerState?.()

    if (serverState?.exited) {
      throw new Error(
        `Server process exited before readiness check completed (code: ${serverState.code ?? 'unknown'})`
      )
    }

    try {
      const response = await fetch(url)

      if (response.ok || response.status === 404) {
        return
      }
    } catch {}

    await sleep(1000)
  }

  throw new Error(`Server is not reachable: ${url}`)
}

async function run() {
  const branch = detectBranchName()
  const baseRef = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
  const baseRefSha = resolveRefSha(baseRef)
  const headSha = getCurrentHeadSha()

  if (!SHOULD_SKIP_CI) {
    await runCommand('pnpm', ['run', 'ci:check'])
  }

  const parsedBaseUrl = new URL(APP_BASE_URL)
  const host = parsedBaseUrl.hostname
  const port = parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? '443' : '80')

  const serverState = {
    exited: false,
    code: null,
  }

  const server = spawn('pnpm', ['start', '--hostname', host, '--port', port], {
    env: process.env,
    stdio: 'inherit',
  })

  server.on('close', code => {
    serverState.exited = true
    serverState.code = code
  })

  try {
    await waitForServer(APP_BASE_URL, () => serverState)

    await runCommand('pnpm', ['run', 'test:e2e:smoke'], {
      ...process.env,
      APP_BASE_URL,
    })
    await runCommand('pnpm', ['run', 'perf:check'], {
      ...process.env,
      APP_BASE_URL,
    })

    const stamp = writeVerificationStamp({
      headSha,
      gate: 'verify:full',
      decision: 'run_full',
      baseRef,
      baseRefSha,
      reason: SHOULD_SKIP_CI
        ? 'verify_full_executed_ci_skipped_by_env'
        : 'verify_full_executed_with_ci',
      ciCheck: SHOULD_SKIP_CI ? 'skipped' : 'passed',
      fullCheck: 'executed',
      branch,
      appBaseUrl: APP_BASE_URL,
    })

    if (stamp) {
      console.log(
        `[verify:full] Verification stamp updated for ${shortSha(stamp.headSha)} (${stamp.filePath})`
      )
    }
  } finally {
    if (!server.killed) {
      server.kill('SIGTERM')
      await sleep(1000)

      if (!server.killed) {
        server.kill('SIGKILL')
      }
    }
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

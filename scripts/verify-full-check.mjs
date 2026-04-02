import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import {
  getCurrentHeadSha,
  resolveRefSha,
  shortSha,
  writeVerificationStamp,
} from './lib/verification-stamp.mjs'

const APP_BASE_URL = process.env.APP_BASE_URL || null
const SHOULD_SKIP_CI = process.env.VERIFY_FULL_SKIP_CI === '1'
const SHOULD_REUSE_REACHABLE_SERVER = process.env.VERIFY_FULL_REUSE_SERVER === '1'
const DEFAULT_SERVER_HOST = '127.0.0.1'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function findFreePort(host) {
  return new Promise((resolve, reject) => {
    const server = createServer()

    server.once('error', reject)
    server.listen(0, host, () => {
      const address = server.address()

      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to resolve free local port')))

        return
      }

      const { port } = address

      server.close(error => {
        if (error) {
          reject(error)
        } else {
          resolve(port)
        }
      })
    })
  })
}

async function isServerReachable(url) {
  try {
    const response = await fetch(url)

    return response.ok || response.status === 404
  } catch {
    return false
  }
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
      if (await isServerReachable(url)) {
        return
      }

      throw new Error(
        `Server process exited before readiness check completed (code: ${serverState.code ?? 'unknown'})`
      )
    }

    if (await isServerReachable(url)) {
      return
    }

    await sleep(1000)
  }

  throw new Error(`Server is not reachable: ${url}`)
}

async function run() {
  const branch = detectBranchName()
  const baseRef = process.env.VERIFY_SMART_BASE_REF || 'origin/develop'
  const baseRefSha = resolveRefSha(baseRef)
  const headSha = getCurrentHeadSha()
  let appBaseUrl = APP_BASE_URL

  if (!SHOULD_SKIP_CI) {
    await runCommand('pnpm', ['run', 'ci:check'])
  }

  if (!appBaseUrl) {
    const freePort = await findFreePort(DEFAULT_SERVER_HOST)

    appBaseUrl = `http://${DEFAULT_SERVER_HOST}:${freePort}`
  }

  const parsedBaseUrl = new URL(appBaseUrl)
  const host = parsedBaseUrl.hostname
  const port = parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? '443' : '80')

  const serverState = {
    exited: false,
    code: null,
  }

  let server = null
  const hasReachableServer = SHOULD_REUSE_REACHABLE_SERVER
    ? await isServerReachable(appBaseUrl)
    : false

  try {
    if (hasReachableServer) {
      console.log(`[verify:full] Reusing existing server at ${appBaseUrl}`)
    } else {
      server = spawn('pnpm', ['start', '--hostname', host, '--port', port], {
        env: process.env,
        stdio: 'inherit',
      })

      server.on('close', code => {
        serverState.exited = true
        serverState.code = code
      })

      await waitForServer(appBaseUrl, () => serverState)
    }

    await runCommand('pnpm', ['run', 'test:e2e:smoke'], {
      ...process.env,
      APP_BASE_URL: appBaseUrl,
      PLAYWRIGHT_SKIP_WEBSERVER: '1',
    })
    await runCommand('pnpm', ['run', 'perf:check'], {
      ...process.env,
      APP_BASE_URL: appBaseUrl,
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
      appBaseUrl,
    })

    if (stamp) {
      console.log(
        `[verify:full] Verification stamp updated for ${shortSha(stamp.headSha)} (${stamp.filePath})`
      )
    }
  } finally {
    if (server && !server.killed) {
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

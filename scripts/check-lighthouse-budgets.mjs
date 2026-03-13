import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://127.0.0.1:3000'
const PERF_BUDGET_PROFILE_ROUTE = process.env.PERF_BUDGET_PROFILE_ROUTE || '/profile/1'

const budgets = {
  '/': {
    performanceScore: 95,
    lcpSeconds: 1.2,
    tbtMs: 150,
    cls: 0.03,
  },
  [PERF_BUDGET_PROFILE_ROUTE]: {
    performanceScore: 95,
    lcpSeconds: 1.6,
    tbtMs: 150,
    cls: 0.03,
  },
}

const routes = ['/', PERF_BUDGET_PROFILE_ROUTE]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function waitForServer(baseUrl) {
  const timeoutMs = 120000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { method: 'GET' })

      if (response.ok || response.status === 404) {
        return
      }
    } catch {}
    await sleep(1000)
  }

  throw new Error(`Server is not reachable: ${baseUrl}`)
}

function toSeconds(value) {
  return Number((value / 1000).toFixed(2))
}

function toScore(value) {
  return Number((value * 100).toFixed(0))
}

function toMetricSummary(route, lhr) {
  return {
    route,
    performanceScore: toScore(lhr.categories.performance.score || 0),
    lcpSeconds: toSeconds(lhr.audits['largest-contentful-paint'].numericValue || 0),
    tbtMs: Number((lhr.audits['total-blocking-time'].numericValue || 0).toFixed(0)),
    cls: Number((lhr.audits['cumulative-layout-shift'].numericValue || 0).toFixed(4)),
  }
}

function validateAgainstBudget(summary, budget) {
  const violations = []

  if (summary.performanceScore < budget.performanceScore) {
    violations.push(
      `[${summary.route}] performanceScore ${summary.performanceScore} < ${budget.performanceScore}`
    )
  }
  if (summary.lcpSeconds > budget.lcpSeconds) {
    violations.push(`[${summary.route}] LCP ${summary.lcpSeconds}s > ${budget.lcpSeconds}s`)
  }
  if (summary.tbtMs > budget.tbtMs) {
    violations.push(`[${summary.route}] TBT ${summary.tbtMs}ms > ${budget.tbtMs}ms`)
  }
  if (summary.cls > budget.cls) {
    violations.push(`[${summary.route}] CLS ${summary.cls} > ${budget.cls}`)
  }

  return violations
}

async function run() {
  await waitForServer(APP_BASE_URL)

  const port = 9222 + Math.floor(Math.random() * 1000)
  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--no-sandbox'],
  })

  try {
    const summaries = []
    const violations = []

    for (const route of routes) {
      const url = new URL(route, APP_BASE_URL).toString()
      const result = await lighthouse(
        url,
        {
          port,
          logLevel: 'error',
          output: 'json',
        },
        desktopConfig
      )

      if (!result || !result.lhr) {
        throw new Error(`Lighthouse did not return report for route: ${route}`)
      }

      const summary = toMetricSummary(route, result.lhr)

      summaries.push(summary)
      violations.push(...validateAgainstBudget(summary, budgets[route]))
    }

    console.table(summaries)

    if (violations.length > 0) {
      console.error('Lighthouse budget check failed:')
      for (const violation of violations) {
        console.error(`- ${violation}`)
      }
      process.exit(1)
    }

    console.log('Lighthouse budget check passed.')
  } finally {
    await browser.close()
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

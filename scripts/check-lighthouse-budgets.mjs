import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import fs from 'node:fs'
import path from 'node:path'

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://127.0.0.1:3000'
const PERF_BUDGET_PROFILE_ROUTE = process.env.PERF_BUDGET_PROFILE_ROUTE || '/profile/1'
const PERF_BUDGET_ROUTE_MODE = resolveRouteMode(process.env.PERF_BUDGET_ROUTE_MODE)
const PERF_INCLUDE_PROTECTED_ROUTES = process.env.PERF_INCLUDE_PROTECTED_ROUTES !== '0'
const PERF_FAIL_ON_REDIRECT = process.env.PERF_FAIL_ON_REDIRECT === '1'
const PERF_SKIP_AUTH_REDIRECTED_ROUTES = process.env.PERF_SKIP_AUTH_REDIRECTED_ROUTES !== '0'
const PERF_ROUTE_PARAM_ID = process.env.PERF_ROUTE_PARAM_ID || '1'
const PERF_ROUTE_PARAM_TAB = process.env.PERF_ROUTE_PARAM_TAB || 'general'
const PERF_ROUTE_PARAM_SLUG = process.env.PERF_ROUTE_PARAM_SLUG || 'sample'
const PERF_EXTRA_ROUTES = parseCsv(process.env.PERF_EXTRA_ROUTES)

const MANIFEST_PATH = path.join(process.cwd(), '.next', 'app-path-routes-manifest.json')
const STATIC_ROUTES = ['/', PERF_BUDGET_PROFILE_ROUTE]
const AUTO_EXTRA_ROUTES = ['/profile/1?postId=1737&from=profile', '/profile/1?action=create']
const PROFILE_BUDGET_PATH = normalizeRoute(PERF_BUDGET_PROFILE_ROUTE).split('?')[0]

const DEFAULT_BUDGET = {
  performanceScore: 95,
  lcpSeconds: 1.6,
  tbtMs: 150,
  cls: 0.03,
}

const HOME_BUDGET = {
  ...DEFAULT_BUDGET,
  lcpSeconds: 1.2,
}

const QUERY_ROUTE_BUDGET = {
  ...DEFAULT_BUDGET,
  cls: 0.05,
}

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
  const requestedRoute = normalizeRoute(route)
  const finalRoute = normalizeRoute(extractPathWithSearch(lhr.finalDisplayedUrl || route))
  const finalPath = finalRoute.split('?')[0]
  const redirected = requestedRoute !== finalRoute

  return {
    route: requestedRoute,
    finalRoute,
    redirected,
    redirectedToAuth: redirected && finalPath === '/auth/login',
    performanceScore: toScore(lhr.categories.performance.score || 0),
    lcpSeconds: toSeconds(lhr.audits['largest-contentful-paint'].numericValue || 0),
    tbtMs: Number((lhr.audits['total-blocking-time'].numericValue || 0).toFixed(0)),
    cls: Number((lhr.audits['cumulative-layout-shift'].numericValue || 0).toFixed(4)),
  }
}

function validateAgainstBudget(summary, budget) {
  if (summary.redirectedToAuth && PERF_SKIP_AUTH_REDIRECTED_ROUTES && !PERF_FAIL_ON_REDIRECT) {
    return []
  }

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
  if (PERF_FAIL_ON_REDIRECT && summary.redirected) {
    violations.push(`[${summary.route}] redirected to ${summary.finalRoute}`)
  }

  return violations
}

function parseCsv(value) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function resolveRouteMode(value) {
  const normalized = String(value || 'static').toLowerCase()

  if (normalized === 'auto' || normalized === 'static') {
    return normalized
  }

  console.warn(
    `Unknown PERF_BUDGET_ROUTE_MODE "${normalized}". Fallback to "static". Supported: "static" | "auto".`
  )

  return 'static'
}

function normalizeRoute(route) {
  if (!route) {
    return '/'
  }

  let value = route

  if (value.startsWith('http://') || value.startsWith('https://')) {
    value = extractPathWithSearch(value)
  }

  if (!value.startsWith('/')) {
    value = `/${value}`
  }

  const [pathname, search] = value.split('?')
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'

  return search ? `${normalizedPath}?${search}` : normalizedPath
}

function extractPathWithSearch(urlLike) {
  try {
    const parsed = new URL(urlLike)

    return `${parsed.pathname}${parsed.search}`
  } catch {
    return String(urlLike)
  }
}

function resolveDynamicSegments(routePattern) {
  return routePattern
    .replace(/\[\[\.\.\.([^\]]+)\]\]/g, PERF_ROUTE_PARAM_SLUG)
    .replace(/\[\.\.\.([^\]]+)\]/g, PERF_ROUTE_PARAM_SLUG)
    .replace(/\[id\]/g, PERF_ROUTE_PARAM_ID)
    .replace(/\[tab\]/g, PERF_ROUTE_PARAM_TAB)
    .replace(/\[[^\]]+\]/g, PERF_ROUTE_PARAM_SLUG)
}

function isSkippableRoute(sourceKey, routePattern) {
  if (sourceKey.includes('/_not-found/')) {
    return true
  }
  if (routePattern === '/_not-found') {
    return true
  }
  if (routePattern.includes('(.)')) {
    return true
  }
  if (!PERF_INCLUDE_PROTECTED_ROUTES && sourceKey.includes('/(protected)/')) {
    return true
  }

  return false
}

function readManifestRoutes() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return []
  }

  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(raw)

  const discoveredRoutes = []

  for (const [sourceKey, routePattern] of Object.entries(manifest)) {
    if (typeof routePattern !== 'string') {
      continue
    }
    if (isSkippableRoute(sourceKey, routePattern)) {
      continue
    }

    const resolved = resolveDynamicSegments(routePattern)
    const normalized = normalizeRoute(resolved)

    if (!normalized.includes('(')) {
      discoveredRoutes.push(normalized)
    }
  }

  return discoveredRoutes
}

function dedupeRoutes(routes) {
  return [...new Set(routes.map(normalizeRoute))]
}

function resolveRoutes() {
  const extras = dedupeRoutes(PERF_EXTRA_ROUTES)

  if (PERF_BUDGET_ROUTE_MODE === 'auto') {
    const manifestRoutes = readManifestRoutes()
    const autoRoutes = dedupeRoutes([...manifestRoutes, ...AUTO_EXTRA_ROUTES, ...extras])

    if (autoRoutes.length > 0) {
      return autoRoutes
    }
  }

  return dedupeRoutes([...STATIC_ROUTES, ...extras])
}

function getBudgetForRoute(route) {
  const normalizedRoute = normalizeRoute(route)
  const pathOnly = normalizedRoute.split('?')[0]

  if (pathOnly === '/') {
    return HOME_BUDGET
  }
  if (normalizedRoute.includes('?')) {
    return QUERY_ROUTE_BUDGET
  }
  if (pathOnly === PROFILE_BUDGET_PATH) {
    return DEFAULT_BUDGET
  }
  if (pathOnly.startsWith('/profile/')) {
    return DEFAULT_BUDGET
  }

  return DEFAULT_BUDGET
}

async function run() {
  await waitForServer(APP_BASE_URL)
  const routes = resolveRoutes()

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
      const budget = getBudgetForRoute(route)
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
      violations.push(...validateAgainstBudget(summary, budget))
    }

    console.table(
      summaries.map(summary => ({
        route: summary.route,
        finalRoute: summary.finalRoute,
        redirected: summary.redirected,
        redirectedToAuth: summary.redirectedToAuth,
        performanceScore: summary.performanceScore,
        lcpSeconds: summary.lcpSeconds,
        tbtMs: summary.tbtMs,
        cls: summary.cls,
      }))
    )

    if (violations.length > 0) {
      console.error('Lighthouse budget check failed:')
      for (const violation of violations) {
        console.error(`- ${violation}`)
      }
      process.exit(1)
    }

    console.log('Lighthouse budget check passed.')
    const authRedirectedCount = summaries.filter(summary => summary.redirectedToAuth).length
    console.log(
      `Route mode: ${PERF_BUDGET_ROUTE_MODE}. Checked routes: ${routes.length}. Include protected: ${PERF_INCLUDE_PROTECTED_ROUTES}. Auth redirects: ${authRedirectedCount}. Skip auth redirects: ${PERF_SKIP_AUTH_REDIRECTED_ROUTES}`
    )
  } finally {
    await browser.close()
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

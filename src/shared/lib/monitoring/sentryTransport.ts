type SentryModule = typeof import('@sentry/browser')

const isProd = process.env.NODE_ENV === 'production'
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const shouldSendToSentry = isProd && Boolean(dsn)
const shouldCaptureWarnings = process.env.NEXT_PUBLIC_SENTRY_CAPTURE_WARNINGS === '1'

let sentryModulePromise: null | Promise<null | SentryModule> = null
let isInitialized = false

function parseSampleRate(value: string | undefined, fallback: number = 0): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseFloat(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  if (parsed < 0) {
    return 0
  }

  if (parsed > 1) {
    return 1
  }

  return parsed
}

function getSentryModule(): Promise<null | SentryModule> {
  if (!shouldSendToSentry || typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (!sentryModulePromise) {
    sentryModulePromise = import('@sentry/browser').catch(() => null)
  }

  return sentryModulePromise
}

async function getInitializedSentryModule(): Promise<null | SentryModule> {
  const sentry = await getSentryModule()

  if (!sentry || isInitialized || !dsn) {
    return sentry
  }

  sentry.init({
    dsn,
    enabled: shouldSendToSentry,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  })

  isInitialized = true

  return sentry
}

function serializeArg(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg
  }

  if (arg instanceof Error) {
    return arg.message
  }

  if (
    typeof arg === 'number' ||
    typeof arg === 'boolean' ||
    arg === null ||
    typeof arg === 'undefined'
  ) {
    return String(arg)
  }

  try {
    return JSON.stringify(arg)
  } catch {
    return String(arg)
  }
}

function toMessage(args: unknown[]): string {
  const message = args.map(serializeArg).join(' ').trim()

  return message || 'Unknown logger message'
}

function getErrorFromArgs(args: unknown[]): Error {
  for (const arg of args) {
    if (arg instanceof Error) {
      return arg
    }
  }

  return new Error(toMessage(args))
}

export function captureMonitoringError(args: unknown[]): void {
  void getInitializedSentryModule().then(sentry => {
    if (!sentry) {
      return
    }

    sentry.captureException(getErrorFromArgs(args))
  })
}

export function captureMonitoringWarning(args: unknown[]): void {
  if (!shouldCaptureWarnings) {
    return
  }

  void getInitializedSentryModule().then(sentry => {
    if (!sentry) {
      return
    }

    sentry.captureMessage(toMessage(args), 'warning')
  })
}

export function initMonitoringClient(): void {
  void getInitializedSentryModule()
}

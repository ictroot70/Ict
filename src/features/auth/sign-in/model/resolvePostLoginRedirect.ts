function isSafeInternalPath(path: string, origin: string): boolean {
  if (!path.startsWith('/')) {
    return false
  }

  if (path.startsWith('//')) {
    return false
  }

  try {
    const parsed = new URL(path, origin)

    return parsed.origin === origin
  } catch {
    return false
  }
}

export function resolvePostLoginRedirectPath(
  rawFrom: null | string | undefined,
  origin: string
): null | string {
  if (!rawFrom) {
    return null
  }

  const candidate = rawFrom.trim()

  if (!candidate) {
    return null
  }

  if (!isSafeInternalPath(candidate, origin)) {
    return null
  }

  try {
    const parsed = new URL(candidate, origin)

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return null
  }
}

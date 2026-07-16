export function normalizeRecaptchaToken(token: null | string | undefined): null | string {
  if (typeof token !== 'string') {
    return null
  }

  const normalized = token.trim()

  return normalized.length > 0 ? normalized : null
}

export function hasValidRecaptchaToken(token: null | string | undefined): boolean {
  return normalizeRecaptchaToken(token) !== null
}

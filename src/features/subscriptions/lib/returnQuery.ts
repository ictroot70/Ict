/**
 * Parses payment return query params from Stripe redirect.
 * Stripe appends ?success=true or ?success=false to the return_url.
 */
export function parsePaymentReturn(searchParams: URLSearchParams): 'success' | 'failed' | null {
  const success = searchParams.get('success')

  if (success === 'true') {
    return 'success'
  }
  if (success === 'false') {
    return 'failed'
  }

  return null
}

/**
 * Removes payment query params from the URL without triggering navigation.
 * Call after processing the return to avoid re-triggering on refresh.
 */
export function cleanupPaymentReturn(pathname: string): string {
  return pathname
}

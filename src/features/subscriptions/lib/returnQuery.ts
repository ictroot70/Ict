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

export const buildPathWithQuery = (
  path: string,
  query: Record<string, string | number | boolean | undefined>
) => {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

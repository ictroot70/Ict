export const formatPrice = (value: number) => {
  const hasCents = Math.round(value * 100) % 100 !== 0

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value)
}

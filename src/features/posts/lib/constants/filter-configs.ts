export const FILTER_CONFIGS = {
  Normal: 'none',
  Clarendon: 'contrast(1.2) saturate(1.35)',
  Lark: 'brightness(1.1) saturate(1.2)',
  Gingham: 'contrast(0.9) brightness(1.1)',
  Moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
} as const

export type FilterName = keyof typeof FILTER_CONFIGS

export const FILTERS = Object.keys(FILTER_CONFIGS).map(name => ({
  name: name as FilterName,
  className: name === 'Normal' ? '' : name.toLowerCase().replace(/\s+/g, '-'),
}))

export type Filter = (typeof FILTERS)[number]

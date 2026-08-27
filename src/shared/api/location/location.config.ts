import packageJson from '@/../package.json'

export const LOCATION_API_CONFIG = {
  NOMINATIM_USER_AGENT: `${packageJson.name}/${packageJson.version} (${
    process.env.NEXT_PUBLIC_GITHUB_REPO ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    'admin@ictroot.uk'
  })`,
  COUNTRIES_API_URL: 'https://countriesnow.space/api/v0.1/countries',
  NOMINATIM_API_URL: 'https://nominatim.openstreetmap.org',
} as const

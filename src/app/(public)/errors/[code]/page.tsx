import {
  StatusErrorPage,
  StatusErrorPageActionLink,
  getOfflineErrorPreset,
  getStatusErrorPreset,
} from '@/shared/composites/StatusErrorPage'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { notFound } from 'next/navigation'

const SUPPORTED_STATUS_CODES = new Set([400, 401, 403, 404, 408, 429, 500, 502, 503])

function resolvePreset(code: string) {
  const normalizedCode = code.trim().toLowerCase()

  if (normalizedCode === 'offline') {
    return getOfflineErrorPreset()
  }

  const parsedCode = Number.parseInt(normalizedCode, 10)

  if (!SUPPORTED_STATUS_CODES.has(parsedCode)) {
    return null
  }

  return getStatusErrorPreset(parsedCode)
}

export default async function ErrorCodePage({
  params,
}: {
  params: Promise<{
    code: string
  }>
}) {
  const { code } = await params
  const preset = resolvePreset(code)

  if (!preset) {
    notFound()
  }

  const isUnauthorized = preset.statusCode === 401
  const primaryHref = isUnauthorized ? APP_ROUTES.AUTH.LOGIN : APP_ROUTES.ROOT
  const primaryLabel = isUnauthorized ? 'Sign in' : 'Go to home'

  return (
    <StatusErrorPage
      statusCode={preset.statusCode}
      title={preset.title}
      description={preset.description}
      variant={preset.variant}
      actions={<StatusErrorPageActionLink href={primaryHref} label={primaryLabel} />}
    />
  )
}

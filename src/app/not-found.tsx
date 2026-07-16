import {
  StatusErrorPage,
  StatusErrorPageActionLink,
  getStatusErrorPreset,
} from '@/shared/composites/StatusErrorPage'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export default function NotFound() {
  const preset = getStatusErrorPreset(404)

  return (
    <StatusErrorPage
      statusCode={preset.statusCode}
      title={preset.title}
      description={preset.description}
      variant={preset.variant}
      actions={<StatusErrorPageActionLink href={APP_ROUTES.ROOT} label={'Go to home'} />}
    />
  )
}

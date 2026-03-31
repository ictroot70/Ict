import React, { ReactNode } from 'react'

import {
  StatusErrorPage,
  StatusErrorPageActionLink,
  getOfflineErrorPreset,
  getStatusErrorPreset,
} from '@/shared/composites/StatusErrorPage'
import { APP_ROUTES } from '@/shared/constant/app-routes'

import { ApiError } from './api'

type ApiErrorBoundaryProps = {
  children: ReactNode
  error: ApiError | null | undefined
}

function renderPrimaryAction(href: string, label: string) {
  return <StatusErrorPageActionLink href={href} label={label} />
}

export function ApiErrorBoundary({ error, children }: ApiErrorBoundaryProps) {
  if (!error) {
    return <>{children}</>
  }

  switch (error.type) {
    case 'FETCH_ERROR': {
      const preset = getOfflineErrorPreset()

      return (
        <StatusErrorPage
          statusCode={preset.statusCode}
          title={preset.title}
          description={preset.description}
          variant={preset.variant}
          actions={renderPrimaryAction(APP_ROUTES.ROOT, 'Go to home')}
        />
      )
    }

    case 'HTTP_ERROR': {
      const preset = getStatusErrorPreset(error.status)
      const action =
        error.status === 401
          ? renderPrimaryAction(APP_ROUTES.AUTH.LOGIN, 'Sign in')
          : renderPrimaryAction(APP_ROUTES.ROOT, 'Go to home')

      return (
        <StatusErrorPage
          statusCode={preset.statusCode}
          title={preset.title}
          description={preset.description}
          variant={preset.variant}
          actions={action}
        />
      )
    }

    case 'PARSE_ERROR': {
      const preset = getStatusErrorPreset(500)

      return (
        <StatusErrorPage
          statusCode={preset.statusCode}
          title={'Response Parsing Error'}
          description={error.message}
          variant={preset.variant}
          actions={renderPrimaryAction(APP_ROUTES.ROOT, 'Go to home')}
        />
      )
    }

    default:
      return (
        <StatusErrorPage
          statusCode={500}
          title={'Unknown Error'}
          description={'Something went wrong.'}
          variant={'neon'}
          actions={renderPrimaryAction(APP_ROUTES.ROOT, 'Go to home')}
        />
      )
  }
}

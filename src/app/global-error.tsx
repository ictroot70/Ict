'use client'

import { useMemo } from 'react'

import { StatusErrorPage, getStatusErrorPreset } from '@/shared/composites/StatusErrorPage'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { extractStatusCodeFromError } from '@/shared/lib/extractStatusCodeFromError'
import { Button } from '@/shared/ui'
import Link from 'next/link'

import './globals.css'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const statusCode = useMemo(() => extractStatusCodeFromError(error), [error])
  const preset = getStatusErrorPreset(statusCode ?? 500)
  const isUnauthorized = preset.statusCode === 401
  const secondaryHref = isUnauthorized ? APP_ROUTES.AUTH.LOGIN : APP_ROUTES.ROOT
  const secondaryLabel = isUnauthorized ? 'Sign in' : 'Go to home'

  return (
    <html lang={'en'}>
      <body>
        <StatusErrorPage
          statusCode={preset.statusCode}
          title={preset.title}
          description={preset.description}
          variant={preset.variant}
          actions={
            <>
              <Button variant={'primary'} onClick={reset}>
                Try again
              </Button>
              <Button as={Link} href={secondaryHref} variant={'outlined'}>
                {secondaryLabel}
              </Button>
            </>
          }
        />
      </body>
    </html>
  )
}

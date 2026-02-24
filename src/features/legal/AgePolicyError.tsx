'use client'

import { APP_ROUTES } from '@/shared/constant'
import { Typography } from '@/shared/ui'
import Link from 'next/link'

interface AgePolicyErrorProps {
  profileId: number | undefined
  onNavigate?: () => void
}

export const AgePolicyError = ({ profileId, onNavigate }: AgePolicyErrorProps) => {
  return (
    <Typography variant={'danger_small'}>
      A user under 13 cannot create a profile.{' '}
      <Link
        onMouseDown={onNavigate}
        onClick={onNavigate}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
        href={{
          pathname: APP_ROUTES.LEGAL.PRIVACY,
          query: {
            from: 'edit-profile',
            ...(profileId ? { id: profileId } : {}),
          },
        }}
      >
        Privacy Policy
      </Link>
    </Typography>
  )
}

import { APP_ROUTES } from '@/shared/constant'
import Link from 'next/link'

export const AgreementLabel = (
  <>
    I agree to the&nbsp;
    <Link
      href={APP_ROUTES.LEGAL.TERMS}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Terms of Service
    </Link>
    &nbsp;and&nbsp;
    <Link
      href={APP_ROUTES.LEGAL.PRIVACY}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Privacy Policy
    </Link>
  </>
)

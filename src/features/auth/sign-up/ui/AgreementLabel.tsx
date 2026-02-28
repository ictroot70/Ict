import { APP_ROUTES } from '@/shared/constant'
import Link from 'next/link'

export const AgreementLabel = (
  <>
    I agree to the&nbsp;
    <Link
      href={{
        pathname: APP_ROUTES.LEGAL.TERMS,
      }}
    >
      Terms of Service
    </Link>
    &nbsp;and&nbsp;
    <Link
      href={{
        pathname: APP_ROUTES.LEGAL.PRIVACY,
        query: {
          from: APP_ROUTES.AUTH.REGISTRATION,
        },
      }}
    >
      Privacy Policy
    </Link>
  </>
)

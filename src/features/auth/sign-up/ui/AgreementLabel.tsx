import { APP_ROUTES } from '@/shared/constant'
import Link from 'next/link'

type AgreementLabelProps = {
  onPolicyNavigate: () => void
}

export const AgreementLabel = ({ onPolicyNavigate }: AgreementLabelProps) => (
  <>
    I agree to the&nbsp;
    <Link
      href={{
        pathname: APP_ROUTES.LEGAL.TERMS,
      }}
      onClick={onPolicyNavigate}
    >
      Terms of Service
    </Link>
    &nbsp;and&nbsp;
    <Link
      href={{
        pathname: APP_ROUTES.LEGAL.PRIVACY,
        query: {
          from: APP_ROUTES.LEGAL.FROM.SIGN_UP,
        },
      }}
      onClick={onPolicyNavigate}
    >
      Privacy Policy
    </Link>
  </>
)

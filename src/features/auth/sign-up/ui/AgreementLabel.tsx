import { APP_ROUTES } from '@/shared/constant'
import Link from 'next/link'

export const AgreementLabel = (
  <>
    I agree to the&nbsp;
    <Link href={APP_ROUTES.LEGAL.TERMS}>Terms of Service</Link>
    &nbsp;and&nbsp;
    <Link href={APP_ROUTES.LEGAL.PRIVACY}>Privacy Policy</Link>
  </>
)

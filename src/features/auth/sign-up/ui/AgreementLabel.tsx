import { APP_ROUTES } from '@/shared/constant'

export const AgreementLabel = (
  <>
    I agree to the&nbsp;
    <a
      href={APP_ROUTES.PUBLIC.TERMS}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Terms of Service
    </a>
    &nbsp;and&nbsp;
    <a
      href={APP_ROUTES.PUBLIC.PRIVACY}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Privacy Policy
    </a>
  </>
)

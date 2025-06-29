import ForgotPasswordForm from '../../forgot-password/ui/ForgotPasswordForm'

export const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/

export const PASSWORD_ALLOWED_CHARACTERS = `0-9, a-z, A-Z, ! "
# $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^
_\` { | } ~`

export const ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  emailExpired: '/email-expired',
} as const

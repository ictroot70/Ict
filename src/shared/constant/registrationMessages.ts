export const REGISTRATION_MESSAGES = {
  EMAIL_EXISTS: 'User with this email is already registered',
  USERNAME_EXISTS: 'User with this username is already registered',
  PASSWORD_DONT_MATCH: 'Passwords must match',
  REFERENCE_EXISTS:
    'Looks like the verification link has expired. Not to worry, we can send the link again',
  NO_RESEND_LINK: 'Failed to resend verification link',
  NETWORK_ERROR: 'Network error. Please try again.',
  SENT_LINK: (email: string) => `We have sent a link to confirm your email to ${email}`,
}

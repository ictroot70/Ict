export type PasswordRecoveryArgs = {
  email: string
  recaptcha: string
  baseUrl: string
}

export const passwordRecovery = async (body: PasswordRecoveryArgs) => {
  return await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'v1/auth/password-recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

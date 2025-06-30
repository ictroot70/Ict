export type passwordRecoveryResendingArgs = {
  email: string
  baseUrl: string
}

export const passwordRecoveryResending = async (body: passwordRecoveryResendingArgs) => {
  return await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'v1/auth/password-recovery-resending', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

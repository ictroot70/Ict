export type CheckRecoveryCodeArgs = {
  recoveryCode: string
}

export const checkRecoveryCode = async (body: CheckRecoveryCodeArgs) => {
  return await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'v1/auth/check-recovery-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

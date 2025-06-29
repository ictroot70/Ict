export type NewPasswordArgs = {
  newPassword: string
  recoveryCode: string
}

export const newPassword = async (body: NewPasswordArgs) => {
  return await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'v1/auth/new-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

import { cookies } from 'next/headers'

const AUTH_SESSION_HINT_KEY = 'auth_session_hint'
const AUTH_SESSION_HINT_VALUE = '1'
const AUTH_USER_ID_HINT_KEY = 'auth_user_id_hint'

export async function getServerAuthSessionHint(): Promise<boolean> {
  const cookieStore = await cookies()

  return cookieStore.get(AUTH_SESSION_HINT_KEY)?.value === AUTH_SESSION_HINT_VALUE
}

export async function getServerAuthUserIdHint(): Promise<number | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(AUTH_USER_ID_HINT_KEY)?.value
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

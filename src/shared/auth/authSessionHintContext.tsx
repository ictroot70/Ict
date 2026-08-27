'use client'

import { ReactNode, createContext, useContext, useEffect, useSyncExternalStore } from 'react'

import {
  AUTH_SESSION_HINT_CHANGE_EVENT,
  getAuthUserIdHint,
  hasAuthSessionHint,
} from '@/shared/lib/storage'

export type AuthSessionHintContextValue = {
  hasAuthHint: boolean
  authUserIdHint: number | null
}

const DEFAULT_AUTH_SESSION_HINT_CONTEXT_VALUE: AuthSessionHintContextValue = {
  hasAuthHint: false,
  authUserIdHint: null,
}

const AuthSessionHintContext = createContext<AuthSessionHintContextValue>(
  DEFAULT_AUTH_SESSION_HINT_CONTEXT_VALUE
)
const AUTH_HINT_HTML_ATTRIBUTE = 'data-auth-hint'
const AUTH_HINT_ENABLED_VALUE = '1'

function serializeAuthSessionHint(value: AuthSessionHintContextValue): string {
  return `${value.hasAuthHint ? '1' : '0'}:${value.authUserIdHint ?? ''}`
}

function deserializeAuthSessionHint(value: string): AuthSessionHintContextValue {
  const [hasAuthHint, rawAuthUserIdHint = ''] = value.split(':')
  const parsedAuthUserIdHint = Number(rawAuthUserIdHint)

  return {
    hasAuthHint: hasAuthHint === '1',
    authUserIdHint:
      Number.isInteger(parsedAuthUserIdHint) && parsedAuthUserIdHint > 0
        ? parsedAuthUserIdHint
        : null,
  }
}

function subscribeToAuthSessionHint(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleStoreChange = () => {
    onStoreChange()
  }

  window.addEventListener('storage', handleStoreChange)
  window.addEventListener(AUTH_SESSION_HINT_CHANGE_EVENT, handleStoreChange)

  return () => {
    window.removeEventListener('storage', handleStoreChange)
    window.removeEventListener(AUTH_SESSION_HINT_CHANGE_EVENT, handleStoreChange)
  }
}

function getClientAuthSessionHintSnapshot(): string {
  if (typeof window === 'undefined') {
    return serializeAuthSessionHint(DEFAULT_AUTH_SESSION_HINT_CONTEXT_VALUE)
  }

  return serializeAuthSessionHint({
    hasAuthHint: hasAuthSessionHint(),
    authUserIdHint: getAuthUserIdHint(),
  })
}

function syncDocumentAuthHintAttribute(hasAuthHint: boolean): void {
  if (typeof document === 'undefined') {
    return
  }

  if (hasAuthHint) {
    document.documentElement.setAttribute(AUTH_HINT_HTML_ATTRIBUTE, AUTH_HINT_ENABLED_VALUE)

    return
  }

  document.documentElement.removeAttribute(AUTH_HINT_HTML_ATTRIBUTE)
}

type Props = {
  value?: AuthSessionHintContextValue
  children: ReactNode
}

export function AuthSessionHintProvider({
  value = DEFAULT_AUTH_SESSION_HINT_CONTEXT_VALUE,
  children,
}: Props) {
  const authSessionHintSnapshot = useSyncExternalStore(
    subscribeToAuthSessionHint,
    getClientAuthSessionHintSnapshot,
    () => serializeAuthSessionHint(value)
  )
  const syncedValue = deserializeAuthSessionHint(authSessionHintSnapshot)

  useEffect(() => {
    syncDocumentAuthHintAttribute(syncedValue.hasAuthHint)
  }, [syncedValue.hasAuthHint])

  return (
    <AuthSessionHintContext.Provider value={syncedValue}>
      {children}
    </AuthSessionHintContext.Provider>
  )
}

export function useAuthSessionHintContext(): AuthSessionHintContextValue {
  return useContext(AuthSessionHintContext)
}

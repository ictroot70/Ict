'use client'

import { ReactNode, createContext, useContext } from 'react'

export type AuthSessionHintContextValue = {
  hasAuthHint: boolean
  authUserIdHint: number | null
}

const AuthSessionHintContext = createContext<AuthSessionHintContextValue>({
  hasAuthHint: false,
  authUserIdHint: null,
})

type Props = {
  value: AuthSessionHintContextValue
  children: ReactNode
}

export function AuthSessionHintProvider({ value, children }: Props) {
  return <AuthSessionHintContext.Provider value={value}>{children}</AuthSessionHintContext.Provider>
}

export function useAuthSessionHintContext(): AuthSessionHintContextValue {
  return useContext(AuthSessionHintContext)
}

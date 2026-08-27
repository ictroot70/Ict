'use client'

import { createContext, useContext } from 'react'

export type AuthRestoreContextValue = {
  isRestoring: boolean
}

const AuthRestoreContext = createContext<AuthRestoreContextValue>({
  // Default: false — если AuthGuard используется вне Provider,
  // блокировка не произойдет и сработает обычный redirect-flow через useSelector.
  // НЕ ставить true: это заблокирует страницы, где нет Provider.
  isRestoring: false,
})

export const AuthRestoreContextProvider = AuthRestoreContext.Provider

export function useAuthRestoreContext(): AuthRestoreContextValue {
  return useContext(AuthRestoreContext)
}

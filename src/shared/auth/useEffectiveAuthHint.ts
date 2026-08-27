'use client'

import { useAuthSessionHintContext } from './authSessionHintContext'

export function useEffectiveAuthHint(): boolean {
  return useAuthSessionHintContext().hasAuthHint
}

'use client'

import { useEffect, useState } from 'react'

import { useAppSelector } from '@/app/store'

export function useAccessToken(): string | null {
  const [token, setToken] = useState<string | null>(null)
  const reduxToken = useAppSelector((state: any) => state.auth?.accessToken)

  useEffect(() => {
    if (reduxToken) {
      setToken(reduxToken)
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessToken')

      if (stored) {
        setToken(stored)
      }
    }
  }, [reduxToken])

  return token
}

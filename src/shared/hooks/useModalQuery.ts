'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Универсальный хук для управления модалками через query-параметры
 * @param paramName - имя query-параметра (например, 'postId', 'action')
 * @param value - значение для проверки (например, 'create', конкретный ID)
 * @returns объект с состоянием модалки и методами управления
 */
export const useModalQuery = (paramName: string, value?: string | number) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const paramValue = searchParams.get(paramName)
  const isOpen = useMemo(() => {
    if (value !== undefined) {
      return paramValue === String(value)
    }
    return Boolean(paramValue)
  }, [paramValue, value])

  const open = useCallback(
    (newValue?: string | number) => {
      const params = new URLSearchParams(searchParams.toString())
      const valueToSet = newValue !== undefined ? String(newValue) : value !== undefined ? String(value) : 'true'

      params.set(paramName, valueToSet)
      const queryString = params.toString()
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname

      router.replace(nextUrl, { scroll: false })
    },
    [pathname, router, searchParams, paramName, value]
  )

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    params.delete(paramName)
    const queryString = params.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams, paramName])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  return {
    isOpen,
    open,
    close,
    toggle,
    value: paramValue,
  }
}


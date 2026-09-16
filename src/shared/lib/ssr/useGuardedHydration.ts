import { useEffect, useRef } from 'react'

type UseGuardedHydrationParams = {
  hydrate: () => void
  hydrateKey: string
  shouldHydrate: boolean
}

export const useGuardedHydration = ({
  hydrate,
  hydrateKey,
  shouldHydrate,
}: UseGuardedHydrationParams) => {
  const hydrateStateRef = useRef<{ done: boolean; key: string }>({
    key: hydrateKey,
    done: false,
  })

  if (hydrateStateRef.current.key !== hydrateKey) {
    hydrateStateRef.current = { key: hydrateKey, done: false }
  }

  useEffect(() => {
    if (hydrateStateRef.current.done || !shouldHydrate) {
      return
    }

    hydrate()
    hydrateStateRef.current.done = true
  }, [hydrate, shouldHydrate])
}

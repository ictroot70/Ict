// hooks/useAuth.ts
import { useMeQuery } from '@/features/auth'

export const useAuth = () => {
  const { data: user, isLoading, isError } = useMeQuery()

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isOwnContent: (ownerId: number) => user?.userId === ownerId,
  }
}

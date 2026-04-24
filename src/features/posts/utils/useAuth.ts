import { useMeQuery } from '@/features/auth'

export const useAuth = () => {
  const { data: user, isLoading, isFetching, isUninitialized, isError } = useMeQuery()
  const isAuthPending = isLoading || isFetching || isUninitialized

  return {
    user,
    isLoading: isAuthPending,
    isError,
    isAuthenticated: !!user,
    isOwnProfile: (ownerId: number) => user?.userId === ownerId,
  }
}

import { useMeQuery } from '@/features/auth'

export const useAuth = () => {
  const { data: user, isLoading, isError } = useMeQuery()

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isOwnProfile: (ownerId: number) => user?.userId === ownerId,
  }
}

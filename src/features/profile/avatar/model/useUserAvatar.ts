// import { useGetPublicProfileQuery } from '@/entities/profile/api'
//
// export const useUserAvatar = (userId?: number) => {
//   const {
//     data: profile,
//     isLoading,
//     error,
//   } = useGetPublicProfileQuery({ profileId: userId ?? 0 }, { skip: !userId })
//
//   return {
//     avatar: profile?.avatars?.[0]?.url,
//     isLoading,
//     error,
//   }
// }

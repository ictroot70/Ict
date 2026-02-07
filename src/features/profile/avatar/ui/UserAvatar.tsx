// import React from 'react'
// import { Avatar } from '@/shared/composites'
//
// import { StaticImageData } from 'next/image'
// import { useUserAvatar } from '@/features/profile/avatar/model/useUserAvatar'
// import { useGetMyProfileQuery } from '@/entities/profile'
//
// interface UserAvatarProps {
//   userId?: number
//   size?: number
//   className?: string
//   fallback?: null | string | StaticImageData
// }
//
// export const UserAvatar: React.FC<UserAvatarProps> = ({
//   userId,
//   size = 40,
//   className,
//   fallback,
// }) => {
//   const { avatar, isLoading } = useUserAvatar(userId)
//
//   if (isLoading) {
//     return (
//       <div
//         className={className}
//         style={{
//           width: size,
//           height: size,
//           borderRadius: '50%',
//           background: 'var(--color-dark-900)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       />
//     )
//   }
//
//   return <Avatar size={size} image={avatar || fallback} className={className} />
// }
//
// export const CurrentUserAvatar: React.FC<Omit<UserAvatarProps, 'userId'>> = props => {
//   const { data: profile } = useGetMyProfileQuery()
//
//   return <UserAvatar userId={profile?.id} {...props} />
// }

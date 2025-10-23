// 'use client'

// import s from './Profile.module.scss'
// import { Typography } from '@/shared/ui'
// import { Avatar } from '@/shared/composites'

// import { ProfileActions } from './ProfileActions/ProfileActions'
// import { ProfileType } from '../../api'
// import { useProfileData } from '../../hooks/useProfileData'
// import { PostViewModel } from '@/entities/posts/api'
// import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'

// interface Props {
//   profile: ProfileType
//   posts?: PostViewModel[]
//   isOwnProfile?: boolean
//   isAuthenticated?: boolean
//   onFollow?: () => void
//   onMessage?: () => void
// }

// const DEFAULT_IMAGE = '/default-image.svg'

// export const Profile: React.FC<Props> = ({
//   profile,
//   posts,
//   isOwnProfile = false,
//   isAuthenticated = false,
//   onFollow,
//   onMessage,
// }) => {
//   const { userName, aboutMe, avatars, followers, following, publications, isFollowing } =
//     useProfileData(profile)

//   const statsData = [
//     { label: 'Following', value: followers },
//     { label: 'Followers', value: following },
//     { label: 'Publications', value: publications },
//   ]

//   const modalVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
//     ? 'public'
//     : isOwnProfile
//       ? 'myPost'
//       : 'userPost'

//   return (
//     <div className={s.profile}>
//       <div className={s.profileDetails}>
//         <Avatar size={204} image={avatars[0]?.url} />
//         <div className={s.profileInfo}>
//           <div className={s.profileInfoHeader}>
//             <Typography variant="h1">{userName}</Typography>
//             <ProfileActions
//               isAuthenticated={isAuthenticated}
//               isOwnProfile={isOwnProfile}
//               onFollow={onFollow}
//               onMessage={onMessage}
//               isFollowing={isFollowing}
//             />
//           </div>
//           <ul className={s.profileStats}>
//             {statsData.map(({ label, value }, index) => (
//               <li key={index} className={s.profileStatsItem}>
//                 <Typography variant="bold_14">{value}</Typography>
//                 <Typography variant="regular_14">{label}</Typography>
//               </li>
//             ))}
//           </ul>
//           <Typography variant="regular_16" className={s.profileAbout}>
//             {aboutMe || 'No information has been added yet.'}
//           </Typography>
//         </div>
//       </div>

//       <div className={s.profileSectionPosts}>
//         {posts ? (
//           <ul className={s.profilePosts}>
//             {posts.map(post => (
//               <PostCard
//                 key={post.id}
//                 id={post.id}
//                 images={post.images}
//                 avatarOwner={post.avatarOwner}
//                 userName={post.userName}
//                 createdAt={post.createdAt}
//                 description={post.description}
//                 modalVariant={modalVariant}
//               />
//             ))}
//           </ul>
//         ) : (
//           <Typography variant="h1" className={s.profilePostsMessage}>
//             {isOwnProfile
//               ? "You haven't published any posts yet"
//               : "This user hasn't published any posts yet"}
//           </Typography>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import s from './Profile.module.scss'
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { PostViewModel } from '@/entities/posts/api'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { useState } from 'react'
import { useDeletePostMutation, useUpdatePostMutation } from '@/entities/posts/api/postApi'
import { DeletePostModal } from '../DeletePostModal'

interface Props {
  profile: ProfileType
  posts?: PostViewModel[]
  isOwnProfile?: boolean
  isAuthenticated?: boolean
  onFollow?: () => void
  onMessage?: () => void
  onRefetchPosts?: () => void
}

export const Profile: React.FC<Props> = ({
  profile,
  posts,
  isOwnProfile = false,
  isAuthenticated = false,
  onFollow,
  onMessage,
  onRefetchPosts,
}) => {
  const { userName, aboutMe, avatars, followers, following, publications, isFollowing } =
    useProfileData(profile)

  const [deletePost] = useDeletePostMutation()
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


  console.log(posts);



  const statsData = [
    { label: 'Following', value: following },
    { label: 'Followers', value: followers },
    { label: 'Publications', value: publications },
  ]

  const modalVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
    ? 'public'
    : isOwnProfile
      ? 'myPost'
      : 'userPost'

  const handleEditPost = async (postId: string) => {
    console.log(`Редактируется пост с ID: ${postId}`)

    if (!profile?.id) {
      console.error('User ID not found')
      return
    }

    const fixedUpdateData = {
      description: `Отредактированный пост ${new Date().toLocaleTimeString()}`,
    }

    try {
      setEditingPostId(postId)

      await updatePost({
        postId: parseInt(postId),
        body: fixedUpdateData,
        userId: profile.id
      }).unwrap()

      onRefetchPosts?.()
      console.log(`Пост с ID: ${postId} успешно обновлен`)
      setEditingPostId(null)

    } catch (error) {
      console.error('Ошибка при редактировании поста:', error)
      setEditingPostId(null)
    }
  }

  const handleDeletePost = (postId: string) => {
    console.log(`Открывается модалка удаления для поста с ID: ${postId}`)
    setSelectedPostId(postId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPostId || !profile?.id) {
      console.error('Post ID or User ID not found')
      return
    }

    console.log(`Удаляется пост с ID: ${selectedPostId}`)

    try {
      setIsDeleting(true)

      const postIdNumber = parseInt(selectedPostId)
      await deletePost({
        postId: postIdNumber,
        userId: profile.id
      }).unwrap()

      console.log(`Пост с ID: ${selectedPostId} успешно удален`)
      setIsDeleteModalOpen(false)
      setSelectedPostId(null)
      onRefetchPosts?.()

    } catch (error) {
      console.error('Ошибка при удалении поста:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setSelectedPostId(null)
    console.log('Удаление отменено')
  }

  return (
    <>
      <div className={s.profile}>
        <div className={s.profileDetails}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profileInfo}>
            <div className={s.profileInfoHeader}>
              <Typography variant="h1">{userName}</Typography>
              <ProfileActions
                isAuthenticated={isAuthenticated}
                isOwnProfile={isOwnProfile}
                onFollow={onFollow}
                onMessage={onMessage}
                isFollowing={isFollowing}
              />
            </div>
            <ul className={s.profileStats}>
              {statsData.map(({ label, value }, index) => (
                <li key={index} className={s.profileStatsItem}>
                  <Typography variant="bold_14">{value}</Typography>
                  <Typography variant="regular_14">{label}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant="regular_16" className={s.profileAbout}>
              {aboutMe || 'No information has been added yet.'}
            </Typography>
          </div>
        </div>

        <div className={s.profileSectionPosts}>
          {posts && posts.length > 0 ? (
            <ul className={s.profilePosts}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  images={post.images}
                  avatarOwner={post.avatarOwner}
                  userName={post.userName}
                  createdAt={post.createdAt}
                  description={post.description}
                  modalVariant={modalVariant}
                  onEditPost={isOwnProfile ? handleEditPost : undefined}
                  onDeletePost={isOwnProfile ? handleDeletePost : undefined}
                  isEditing={editingPostId === post.id.toString()}
                  userId={profile.id}
                />
              ))}
            </ul>
          ) : (
            <Typography variant="h1" className={s.profilePostsMessage}>
              {isOwnProfile
                ? "You haven't published any posts yet"
                : "This user hasn't published any posts yet"}
            </Typography>
          )}
        </div>
      </div>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        postId={selectedPostId || ''}
        isLoading={isDeleting}
      />
    </>
  )
}
'use client'

import { ReactElement, useState } from 'react'
import { useGetMyProfileQuery, useGetProfileWithPostsQuery } from '@/entities/profile'
import s from './ProfileClient.module.scss'
import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant'
import { useDeletePostMutation, useGetPostsByUserQuery, useUpdatePostMutation } from '@/entities/posts/api/postApi'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { DeletePostModal } from './DeletePostModal'

export const ProfileClient = (): ReactElement => {
  const { data: meInfo, isSuccess } = useGetMyProfileQuery()
  const { data: profileWithPosts } = useGetProfileWithPostsQuery(meInfo?.userName as string, {
    skip: !meInfo?.userName || !isSuccess,
  })
  const { data: userPosts, isLoading: postsLoading, refetch } = useGetPostsByUserQuery(
    {
      userId: meInfo?.id || 0,
      endCursorPostId: 0,
      pageSize: 12
    },
    { skip: !meInfo?.id }
  )

  console.log(`Пользователь: ${userPosts?.items?.length || 0} постов, ID = ${meInfo?.id}`)

  const [deletePost] = useDeletePostMutation()
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUserQuery(
    { userId: meInfo?.id ?? 0, endCursorPostId: 0 },
    { skip: !meInfo?.id }
  )
  const avatarUrl = profileWithPosts?.avatars[0]?.url

  const statsData = [
    { label: 'Following', value: profileWithPosts?.followingCount || 0 },
    { label: 'Followers', value: profileWithPosts?.followersCount || 0 },
    { label: 'Publications', value: userPosts?.items?.length || 0 },
  ]

  console.log(profileWithPosts?.publicationsCount)

  const handleEditPost = async (postId: string) => {
    console.log(`Редактируется пост с ID: ${postId}`)

    if (!meInfo?.id) {
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
        userId: meInfo.id
      }).unwrap()

      refetch()

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
    if (!selectedPostId || !meInfo?.id) {
      console.error('Post ID or User ID not found')
      return
    }

    console.log(`Удаляется пост с ID: ${selectedPostId}`)

    try {
      setIsDeleting(true)

      const postIdNumber = parseInt(selectedPostId)
      await deletePost({
        postId: postIdNumber,
        userId: meInfo.id
      }).unwrap()

      console.log(`Пост с ID: ${selectedPostId} успешно удален`)

      // Закрываем модалку и сбрасываем состояния
      setIsDeleteModalOpen(false)
      setSelectedPostId(null)

      // Можно добавить refetch если нужно
      // refetch()

    } catch (error) {
      console.error('Ошибка при удалении поста:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // ← ДОБАВИТЬ функцию отмены удаления
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setSelectedPostId(null)
    console.log('Удаление отменено')
  }

  const getPostImageUrl = (post: any, index: number) => {
    if (post?.images?.[0]?.url) {
      return post.images[0].url
    }
    return `/mock/image_${index + 1}.jpg`
  }

  const getPostDescription = (post: any) => {
    return post?.description || `Post ${post?.id || ''}`
  }

  return (
    <>
      {isSuccess && (
        <div className={s.profile}>
          <div className={s.profileDetails}>
            <Avatar size={204} image={avatarUrl} />
            <div className={s.profileInfo}>
              <div className={s.profileInfoHeader}>
                <Typography variant="h1">{meInfo.userName}</Typography>
                <div className={s.profileActions}>
                  <Button
                    as={Link}
                    variant="secondary"
                    href={APP_ROUTES.PROFILE.EDIT(`${meInfo.id}`)}
                  >
                    Profile Settings
                  </Button>
                </div>
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
                {meInfo.aboutMe || 'No information has been added yet.'}
              </Typography>
            </div>
          </div>
          <div className={s.profilePosts}>
            {isPostsLoading && <Typography>Loading posts...</Typography>}

            {postsData?.items?.length
              ? postsData.items.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  images={post.images}
                  avatarOwner={post.avatarOwner}
                  userName={post.userName}
                  createdAt={post.createdAt}
                  description={post.description}
                  modalVariant={'myPost'}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  isEditing={editingPostId === post.id.toString()}
                  userId={meInfo?.id}
                />
              ))
              : !isPostsLoading && <Typography>No posts yet.</Typography>}
          </div>
        </div>
      )}


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
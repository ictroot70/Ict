'use client'

import { ReactElement, useState } from 'react' // ← Добавить useState

import { useGetMyProfileQuery, useGetProfileWithPostsQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import Image from 'next/image'
import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { useDeletePostMutation, useGetPostsByUserQuery, useUpdatePostMutation } from '@/entities/posts/api/postApi'

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

  const avatarUrl = profileWithPosts?.avatars[0]?.url

  const statsData = [
    { label: 'Following', value: profileWithPosts?.followingCount || 0 },
    { label: 'Followers', value: profileWithPosts?.followersCount || 0 },
    { label: 'Publications', value: profileWithPosts?.publicationsCount || 0 },
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

  const handleDeletePost = async (postId: string) => {
    console.log(`Удаляется пост с ID: ${postId}`)

    try {
      if (!meInfo?.id) {
        console.error('User ID not found')
        return
      }

      const postIdNumber = parseInt(postId)
      await deletePost({
        postId: postIdNumber,
        userId: meInfo.id
      }).unwrap()

      console.log(`Пост с ID: ${postId} успешно удален`)
    } catch (error) {
      console.error('Ошибка при удалении поста:', error)
    }
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

          <div className={s.postsSection}>
            <Typography variant="h2" className={s.postsTitle}>
              My Posts
            </Typography>

            {postsLoading ? (
              <div className={s.loading}>Loading posts...</div>
            ) : (
              <ul className={s.profilePosts}>
                {userPosts?.items?.map((post, index) => (
                  <div key={post.id} className={s.profilePostsItem}>
                    <div className={s.imageContainer}>
                      <Image
                        src={getPostImageUrl(post, index)}
                        fill
                        alt={getPostDescription(post)}
                        className={s.profileImage}
                      />

                      <div className={s.editDeleteWrapper}>
                        <EditDeletePost
                          postId={post.id.toString()}
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                          isEditing={editingPostId === post.id.toString()}
                        />
                      </div>
                    </div>

                    {/* Информация о посте */}
                    <div className={s.postInfo}>
                      <Typography variant="regular_14" className={s.postDescription}>
                        {/* ← ИЗМЕНИТЬ эту строку */}
                        {editingPostId === post.id.toString() ? 'Редактирование...' : getPostDescription(post)}
                      </Typography>
                      <Typography variant="regular_12" className={s.postDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                ))}

                {(!userPosts?.items || userPosts.items.length === 0) && (
                  <div className={s.noPosts}>
                    <Typography variant="regular_16">
                      No posts yet. Create your first post!
                    </Typography>
                  </div>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}
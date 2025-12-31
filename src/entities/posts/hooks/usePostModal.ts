import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import { useAuth } from '@/features/posts/utils/useAuth'
import {
  mapPostToModalData,
  PostModalData,
  PostVariant,
  CommentFormData, // ← добавил
  DescriptionFormData, // ← добавил
  PostViewModel,
} from '@/shared/types'
import { useSearchParams } from 'next/navigation'

export const usePostModal = (open: boolean, initialPostData?: PostViewModel, postId?: number) => {
  const [comments, setComments] = useState<string[]>([])
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    watch: watchComment,
  } = useForm<CommentFormData>({
    defaultValues: { comment: '' },
  })

  const {
    control: descriptionControl,
    handleSubmit: handleDescriptionSubmit,
    reset: resetDescription,
    watch: watchDescription,
    formState: { errors },
  } = useForm<DescriptionFormData>({
    defaultValues: { description: '' },
    mode: 'onChange',
  })

  const searchParams = useSearchParams()
  // Используем переданный postId или пытаемся получить из query (для обратной совместимости)
  const postIdFromQuery = searchParams.get('postId')
  const finalPostId = postId || (postIdFromQuery ? Number(postIdFromQuery) : undefined)

  // Используем RTK Query только если нет initialPostData
  const { data: postDataFromQuery } = useGetPostByIdQuery(finalPostId as number, {
    skip: !open || !finalPostId || !!initialPostData,
  })

  // Приоритет: initialPostData > данные из RTK Query
  const postData = initialPostData || postDataFromQuery

  const { user, isAuthenticated } = useAuth()

  const isOwnProfile = Boolean(
    isAuthenticated && postData?.ownerId && user?.userId && postData.ownerId === user.userId
  )

  let variant: PostVariant = 'public'

  if (isAuthenticated) {
    variant = isOwnProfile ? 'myPost' : 'userPost'
  }
  const postModalData: PostModalData = postData
    ? mapPostToModalData(postData)
    : {
        images: [],
        userName: '',
        avatar: '',
        description: '',
        createdAt: new Date().toISOString(),
        postId: '',
        ownerId: undefined,
      }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(postModalData.createdAt))

  useEffect(() => {
    resetDescription({ description: postModalData.description })
  }, [postModalData.description, resetDescription])

  const handlePublish = (data: CommentFormData) => {
    const trimmed = data.comment.trim()

    if (!trimmed) {
      return
    }
    setComments(prev => [...prev, trimmed])
    resetComment()
  }

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleCancelEdit = () => {
    resetDescription({ description: postModalData.description })
    setIsEditingDescription(false)
  }

  return {
    comments,
    isEditingDescription,
    setIsEditingDescription,
    commentControl,
    handleCommentSubmit,
    watchComment,
    descriptionControl,
    handleDescriptionSubmit,
    watchDescription,
    errors,
    postData: postModalData,
    variant,
    isAuthenticated,
    isOwnProfile,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
  }
}

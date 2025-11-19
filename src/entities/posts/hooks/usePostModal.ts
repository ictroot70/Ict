// import { useState, useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { useSearchParams } from 'next/navigation'
// import { useAuth } from '@/features/posts/utils/useAuth'
// import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
// import { mapPostToModalData, PostFormData, PostModalData, PostVariant } from '@/shared/types'

// export const usePostModal = (open: boolean) => {
//   const [comments, setComments] = useState<string[]>([])
//   const [isEditingDescription, setIsEditingDescription] = useState(false)

//   // Формы
//   const {
//     control: commentControl,
//     handleSubmit: handleCommentSubmit,
//     reset: resetComment,
//     watch: watchComment,
//   } = useForm<PostFormData>({
//     defaultValues: { comment: '' },
//   })

//   const {
//     control: descriptionControl,
//     handleSubmit: handleDescriptionSubmit,
//     reset: resetDescription,
//     watch: watchDescription,
//     formState: { errors },
//   } = useForm<PostFormData>({
//     defaultValues: { description: '' },
//     mode: 'onChange',
//   })

//   // Получение данных поста
//   const searchParams = useSearchParams()
//   const postIdFromQuery = searchParams.get('postId')
//   const postId = postIdFromQuery ? Number(postIdFromQuery) : undefined

//   const { data: postData } = useGetPostByIdQuery(postId as number, {
//     skip: !open || !postId,
//   })

//   const { user, isAuthenticated } = useAuth()

//   // Вычисляемые значения
//   const isOwnProfile = Boolean(
//     isAuthenticated && postData?.ownerId && user?.userId && postData.ownerId === user.userId
//   )

//   const variant: PostVariant = !isAuthenticated ? 'public' : isOwnProfile ? 'myPost' : 'userPost'

//   const postModalData: PostModalData = postData
//     ? mapPostToModalData(postData)
//     : {
//         images: [],
//         userName: '',
//         avatar: '',
//         description: '',
//         createdAt: new Date().toISOString(),
//         postId: '',
//         ownerId: undefined,
//       }

//   const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   }).format(new Date(postModalData.createdAt))

//   // Эффекты
//   useEffect(() => {
//     resetDescription({ description: postModalData.description })
//   }, [postModalData.description, resetDescription])

//   // Обработчики
//   const handlePublish = ({ comment }: PostFormData) => {
//     const trimmed = comment.trim()
//     if (!trimmed) return
//     setComments(prev => [...prev, trimmed])
//     resetComment()
//   }

//   const handleEditPost = () => {
//     setIsEditingDescription(true)
//   }

//   const handleCancelEdit = () => {
//     resetDescription({ description: postModalData.description })
//     setIsEditingDescription(false)
//   }

//   return {
//     // State
//     comments,
//     isEditingDescription,
//     setIsEditingDescription,

//     // Form controls
//     commentControl,
//     handleCommentSubmit,
//     watchComment,
//     descriptionControl,
//     handleDescriptionSubmit,
//     watchDescription,
//     errors,

//     // Post data
//     postData: postModalData,

//     // Computed values
//     variant,
//     isAuthenticated,
//     isOwnProfile,
//     formattedCreatedAt,

//     // Handlers
//     handlePublish,
//     handleEditPost,
//     handleCancelEdit,
//   }
// }

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/posts/utils/useAuth'
import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import {
  mapPostToModalData,
  PostModalData,
  PostVariant,
  CommentFormData, // ← добавил
  DescriptionFormData, // ← добавил
} from '@/shared/types'

export const usePostModal = (open: boolean) => {
  const [comments, setComments] = useState<string[]>([])
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Форма для комментариев
  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    watch: watchComment,
  } = useForm<CommentFormData>({
    // ← изменил тип
    defaultValues: { comment: '' },
  })

  // Форма для описания
  const {
    control: descriptionControl,
    handleSubmit: handleDescriptionSubmit,
    reset: resetDescription,
    watch: watchDescription,
    formState: { errors },
  } = useForm<DescriptionFormData>({
    // ← изменил тип
    defaultValues: { description: '' },
    mode: 'onChange',
  })

  // Получение данных поста
  const searchParams = useSearchParams()
  const postIdFromQuery = searchParams.get('postId')
  const postId = postIdFromQuery ? Number(postIdFromQuery) : undefined

  const { data: postData } = useGetPostByIdQuery(postId as number, {
    skip: !open || !postId,
  })

  const { user, isAuthenticated } = useAuth()

  // Вычисляемые значения
  const isOwnProfile = Boolean(
    isAuthenticated && postData?.ownerId && user?.userId && postData.ownerId === user.userId
  )

  const variant: PostVariant = !isAuthenticated ? 'public' : isOwnProfile ? 'myPost' : 'userPost'

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

  // Эффекты
  useEffect(() => {
    resetDescription({ description: postModalData.description })
  }, [postModalData.description, resetDescription])

  // Обработчики
  const handlePublish = (data: CommentFormData) => {
    // ← изменил тип параметра
    const trimmed = data.comment.trim()
    if (!trimmed) return
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
    // State
    comments,
    isEditingDescription,
    setIsEditingDescription,

    // Form controls
    commentControl,
    handleCommentSubmit,
    watchComment,
    descriptionControl,
    handleDescriptionSubmit,
    watchDescription,
    errors,

    // Post data
    postData: postModalData,

    // Computed values
    variant,
    isAuthenticated,
    isOwnProfile,
    formattedCreatedAt,

    // Handlers
    handlePublish,
    handleEditPost,
    handleCancelEdit,
  }
}

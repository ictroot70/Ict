// // import { ReactElement, useState } from 'react'

// // import Image from 'next/image'

// // import { Button, Modal, Typography } from '@/shared/ui'

// // import s from './PostModal.module.scss'
// // import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
// // import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
// // import { ControlledInput } from '@/features/formControls'
// // import { useForm } from 'react-hook-form'
// // import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
// // import { Avatar } from '@/shared/composites'

// // type Props = {
// //   variant: 'public' | 'myPost' | 'userPost'
// //   open: boolean
// //   onClose: () => void
// //   images: string[]
// //   initialIndex?: number
// //   avatarOwner?: string
// //   userName: string
// //   createdAt: string
// //   description?: string
// //   postId: string
// //   userId: number
// //   onEditPost?: (postId: string) => void
// //   onDeletePost?: (postId: string) => void
// //   isEditing?: boolean
// // }

// // type CommentForm = { comment: string }

// // export const PostModal = ({
// //   open,
// //   onClose,
// //   images,
// //   variant,
// //   userName,
// //   avatarOwner,
// //   createdAt,
// //   description,
// //   postId,           // ← деструктурируйте
// //   userId,           // ← деструктурируйте
// //   onEditPost,       // ← деструктурируйте
// //   onDeletePost,     // ← деструктурируйте
// //   isEditing,        // ← деструктурируйте
// // }: Props): ReactElement => {
// //   const [comments, setComments] = useState<string[]>([
// //     // 'Awesome shot! The colors are incredible.',
// //     // 'Looks like a perfect vacation spot.',
// //   ])

// //   const { control, handleSubmit, reset, watch } = useForm<CommentForm>({
// //     defaultValues: { comment: '' },
// //   })

// //   const handlePublish = ({ comment }: CommentForm) => {
// //     const trimmed = comment.trim()
// //     if (!trimmed) return
// //     setComments(prev => [...prev, trimmed])
// //     reset()
// //   }

// //   const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
// //     year: 'numeric',
// //     month: 'long',
// //     day: 'numeric',
// //   }).format(new Date(createdAt))



// //   return (
// //     <Modal open={open} onClose={onClose} closeBtnOutside={true} className={s.modal}>
// //       <div className={s.innerModal}>
// //         <div className={s.photoContainer}>
// //           {images.length > 1 ? (
// //             <EmblaCarousel photos={images} />
// //           ) : (
// //             <Image src={images[0]} alt={'Post image'} fill className={s.image} />
// //           )}
// //         </div>
// //         <div className={s.postSideBar}>
// //           <div className={s.postHeader}>
// //             <div className={s.username}>
// //               <Avatar size={36} image={avatarOwner} />

// //               <Typography variant={'h3'} color={'light'}>
// //                 {userName}
// //               </Typography>
// //             </div>

// //             {variant !== 'public' && (
// //               <EditDeletePost
// //                 postId={postId}
// //                 onEdit={onEditPost || (() => { })}
// //                 onDelete={onDeletePost || (() => { })}
// //                 isEditing={isEditing}
// //               />
// //             )}
// //           </div>

// //           <Separator />
// //           <div className={s.comments}>
// //             <div className={s.comment}>
// //               <Avatar size={36} image={avatarOwner} />

// //               <div>
// //                 <Typography variant={'regular_14'} color={'light'}>
// //                   <strong>{userName}</strong> {description}
// //                 </Typography>
// //                 <Typography variant="small_text" className={s.commentTimestamp}>
// //                   2 minute ago
// //                 </Typography>
// //               </div>
// //             </div>
// //             {comments.map((comment, index) => (
// //               <div className={s.comment} key={index}>
// //                 <Avatar size={36} image={avatarOwner} />

// //                 <div>
// //                   <Typography variant={'regular_14'} color={'light'}>
// //                     <strong> UserName</strong> {comment}
// //                   </Typography>
// //                   <Typography variant="small_text" className={s.commentTimestamp}>
// //                     2 minute ago
// //                   </Typography>
// //                 </div>
// //                 <Button variant={'text'} className={s.commentLikeButton}>
// //                   <HeartOutline size={16} color={'white'} />
// //                 </Button>
// //               </div>
// //             ))}
// //           </div>
// //           <Separator />

// //           <div className={s.footer}>
// //             {variant !== 'public' && (
// //               <div className={s.likeSendSave}>
// //                 <Button variant={'text'} className={s.postButton}>
// //                   <HeartOutline color={'white'} />
// //                 </Button>
// //                 <Button variant={'text'} className={s.postButton}>
// //                   <PaperPlane color={'white'} />
// //                 </Button>
// //                 <Button variant={'text'} className={s.postButton}>
// //                   <BookmarkOutline color={'white'} />
// //                 </Button>
// //               </div>
// //             )}
// //             <div className={s.likesRow} style={{ textWrap: 'wrap' }}>
// //               <div className={s.likesAvatars}>
// //                 <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
// //                 <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
// //                 <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
// //               </div>
// //               <div>
// //                 <Typography variant={'regular_14'} color={'light'}>
// //                   2 243 "<strong>Like</strong>"
// //                 </Typography>
// //               </div>
// //             </div>
// //             <Typography variant="small_text" className={s.timestamp}>
// //               {formattedCreatedAt}
// //             </Typography>

// //             {variant !== 'public' && (
// //               <>
// //                 <Separator className={s.separator} />
// //                 <form onSubmit={handleSubmit(handlePublish)} className={s.inputForm}>
// //                   <ControlledInput<CommentForm>
// //                     name={'comment'}
// //                     control={control}
// //                     inputType={'text'}
// //                     placeholder={'Add a Comment'}
// //                     className={s.input}
// //                   />
// //                   <Button variant={'text'} type={'submit'} disabled={!watch('comment')?.trim()}>
// //                     Publish
// //                   </Button>
// //                 </form>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </Modal>
// //   )
// // }

// // export default PostModal



// 'use client'

// import { ReactElement, useState, useEffect } from 'react'
// import Image from 'next/image'
// import { Button, Modal, Typography } from '@/shared/ui'
// import s from './PostModal.module.scss'
// import { Separator } from '@ictroot/ui-kit'
// import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
// import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
// import { Avatar } from '@/shared/composites'
// import { useUpdatePostMutation } from '@/entities/posts/api/postApi'
// import { DeletePostModal } from '../DeletePostModal'

// type Props = {
//   variant: 'public' | 'myPost' | 'userPost'
//   open: boolean
//   onClose: () => void
//   images: string[]
//   avatarOwner?: string
//   userName: string
//   createdAt: string
//   description?: string
//   postId: string
//   userId: number
//   onDeletePost?: (postId: string) => void
// }

// export const PostModal = ({
//   open,
//   onClose,
//   images,
//   variant,
//   userName,
//   avatarOwner,
//   createdAt,
//   description: initialDescription,
//   postId,
//   userId,
//   onDeletePost,
// }: Props): ReactElement => {
//   const [isEditing, setIsEditing] = useState(false)
//   const [currentDescription, setCurrentDescription] = useState(initialDescription || '')
//   const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

//   // Синхронизируем описание при открытии модалки
//   useEffect(() => {
//     if (open) {
//       setCurrentDescription(initialDescription || '')
//       setIsEditing(false)
//     }
//   }, [open, initialDescription])

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing)
//   }

//   const handleSave = async () => {
//     try {
//       await updatePost({
//         postId: parseInt(postId),
//         body: { description: currentDescription },
//         userId,
//       }).unwrap()
//       setIsEditing(false)
//     } catch (error) {
//       console.error('Failed to update post:', error)
//     }
//   }

//   const handleDeleteClick = () => {
//     setIsDeleteModalOpen(true)
//   }

//   const handleConfirmDelete = async () => {
//     if (onDeletePost) {
//       onDeletePost(postId)
//       setIsDeleteModalOpen(false)
//       onClose()
//     }
//   }

//   const handleCancelDelete = () => {
//     setIsDeleteModalOpen(false)
//   }

//   const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   }).format(new Date(createdAt))

//   return (
//     <>
//       <Modal open={open} onClose={onClose} closeBtnOutside className={s.modal}>
//         <div className={s.innerModal}>
//           <div className={s.photoContainer}>
//             {images.length > 1 ? (
//               <EmblaCarousel photos={images} />
//             ) : (
//               <Image src={images[0]} alt="Post image" fill className={s.image} />
//             )}
//           </div>

//           <div className={s.postSideBar}>
//             <div className={s.postHeader}>
//               <div className={s.username}>
//                 <Avatar size={36} image={avatarOwner} />
//                 <Typography variant="h3" color="light">
//                   {userName}
//                 </Typography>
//               </div>

//               {variant !== 'public' && (
//                 <EditDeletePost
//                   postId={postId}
//                   onEdit={handleEditToggle}
//                   onDelete={handleDeleteClick}
//                   isEditing={isEditing}
//                 />
//               )}
//             </div>

//             <Separator />

//             <div className={s.comments}>
//               <div className={s.comment}>
//                 <Avatar size={36} image={avatarOwner} />
//                 <div className={s.descriptionContainer}>
//                   {isEditing ? (
//                     <textarea
//                       value={currentDescription}
//                       onChange={e => setCurrentDescription(e.target.value)}
//                       className={s.editTextarea}
//                       disabled={isUpdating}
//                       placeholder="Write a description..."
//                     />
//                   ) : (
//                     <>
//                       <Typography variant="regular_14" color="light">
//                         <strong>{userName}</strong> {currentDescription}
//                       </Typography>
//                       <Typography variant="small_text" className={s.commentTimestamp}>
//                         {formattedCreatedAt}
//                       </Typography>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {isEditing && (
//               <div className={s.editActions}>
//                 <Button
//                   variant="secondary"
//                   onClick={() => {
//                     setCurrentDescription(initialDescription || '')
//                     setIsEditing(false)
//                   }}
//                   disabled={isUpdating}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="primary"
//                   onClick={handleSave}
//                   disabled={isUpdating || currentDescription === initialDescription}
//                 >
//                   {isUpdating ? 'Saving...' : 'Save'}
//                 </Button>
//               </div>
//             )}

//             {!isEditing && (
//               <>
//                 <Separator />
//                 <div className={s.footer}>
//                   {/* Likes, share, etc. — можно оставить или убрать */}
//                   <Typography variant="small_text" className={s.timestamp}>
//                     {formattedCreatedAt}
//                   </Typography>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </Modal>

//       <DeletePostModal
//         isOpen={isDeleteModalOpen}
//         onClose={handleCancelDelete}
//         onConfirm={handleConfirmDelete}
//         isLoading={false}
//       />
//     </>
//   )
// }

// export default PostModal






















//
'use client'

import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Typography } from '@/shared/ui'
import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { ControlledInput, } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
import { Avatar } from '@/shared/composites'
import { DeletePostModal } from '../DeletePostModal'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'

type CommentForm = { comment: string }
type EditDescriptionForm = { description: string }

type Props = {
  variant: 'public' | 'myPost' | 'userPost'
  open: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  avatarOwner?: string
  userName: string
  createdAt: string
  description?: string
  postId: string
  userId: number
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
}

export const PostModal = ({
  open,
  onClose,
  images,
  variant,
  userName,
  avatarOwner,
  createdAt,
  description = '',
  postId,
  userId,
  onEditPost,
  onDeletePost,
  isEditing,
}: Props): ReactElement => {
  const [comments, setComments] = useState<string[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const { control: commentControl, handleSubmit: handleCommentSubmit, reset: resetComment, watch: watchComment } = useForm<CommentForm>({
    defaultValues: { comment: '' },
  })

  const { control: descriptionControl, handleSubmit: handleDescriptionSubmit, reset: resetDescription, watch: watchDescription, formState: { errors } } = useForm<EditDescriptionForm>({
    defaultValues: { description: description || '' },
    mode: 'onChange'
  })

  const descriptionValue = watchDescription('description') || ''
  const characterCount = descriptionValue.length
  const maxCharacters = 500

  // Сбрасываем форму редактирования при изменении описания
  useEffect(() => {
    resetDescription({ description: description || '' })
  }, [description, resetDescription])

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    resetComment()
  }

  const handleSaveDescription = ({ description: newDescription }: EditDescriptionForm) => {
    const trimmed = newDescription.trim()
    if (trimmed && onEditPost) {
      onEditPost(postId, trimmed)
      setIsEditingDescription(false)
    }
  }

  const handleCancelEdit = () => {
    resetDescription({ description: description || '' })
    setIsEditingDescription(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingDescription) {
          handleCancelEdit()
        } else {
          onClose()
        }
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, isEditingDescription])

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleDeletePost = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (onDeletePost) {
      setIsDeleting(true)
      try {
        onDeletePost(postId)
        setIsDeleteModalOpen(false)
        onClose()
      } catch (error) {
        console.error('Failed to delete post:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
  }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt))

  return (
    <>
      <Modal open={open} onClose={onClose} closeBtnOutside className={s.modal}>
        <div className={s.innerModal} onClick={handleOverlayClick}>
          {/* Режим редактирования */}
          {isEditingDescription ? (
            <div className={s.editMode}>
              {/* Шапка редактирования */}
              <div className={s.editHeader}>
                <Typography variant="h1" className={s.editTitle}>
                  Edit Post
                </Typography>
                <Button
                  variant="text"
                  onClick={handleCancelEdit}
                  className={s.closeButton}
                >
                  {/* <CloseOutline size={24} /> */}
                </Button>
              </div>

              <div className={s.editContent}>
                {/* Левая часть - изображение */}
                <div className={s.editImageContainer}>
                  {images.length > 1 ? (
                    <EmblaCarousel photos={images} />
                  ) : (
                    <Image src={images[0]} alt={'Post image'} fill className={s.editImage} />
                  )}
                </div>

                {/* Правая часть - форма редактирования */}
                <div className={s.editFormContainer}>
                  <div className={s.userInfo}>
                    <Avatar size={36} image={avatarOwner} />
                    <Typography variant={'h3'} color={'light'}>
                      {userName}
                    </Typography>
                  </div>

                  <div className={s.editFormSection}>
                    <Typography variant="regular_14" className={s.formLabel}>
                      Add publication descriptions
                    </Typography>

                    <form onSubmit={handleDescriptionSubmit(handleSaveDescription)} className={s.editDescriptionForm}>
                      <ControlledTextarea<EditDescriptionForm>
                        name={'description'}
                        control={descriptionControl}
                        placeholder={'Write your description here...'}
                        className={s.descriptionTextarea}
                        rules={{
                          maxLength: {
                            value: maxCharacters,
                            message: `Description must be less than ${maxCharacters} characters`
                          }
                        }}
                      />
                      <div className={s.characterCounter}>
                        <Typography
                          variant="small_text"
                          className={characterCount > maxCharacters ? s.characterError : s.characterInfo}
                        >
                          {characterCount}/{maxCharacters}
                        </Typography>
                      </div>

                      {errors.description && (
                        <Typography variant="small_text" className={s.errorMessage}>
                          {errors.description.message}
                        </Typography>
                      )}

                      <div className={s.editDescriptionActions}>
                        <Button
                          variant={'outlined'}
                          type="button"
                          onClick={handleCancelEdit}
                          className={s.cancelEditButton}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={'primary'}
                          type={'submit'}
                          disabled={!descriptionValue.trim() || characterCount > maxCharacters}
                          className={s.saveEditButton}
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Обычный режим просмотра */
            <div className={s.viewMode}>
              <div className={s.photoContainer}>
                {images.length > 1 ? (
                  <EmblaCarousel photos={images} />
                ) : (
                  <Image src={images[0]} alt={'Post image'} fill className={s.image} />
                )}
              </div>
              <div className={s.postSideBar}>
                <div className={s.postHeader}>
                  <div className={s.username}>
                    <Avatar size={36} image={avatarOwner} />
                    <Typography variant={'h3'} color={'light'}>
                      {userName}
                    </Typography>
                  </div>

                  {variant !== 'public' && (
                    <EditDeletePost
                      postId={postId}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      isEditing={isEditing}
                    />
                  )}
                </div>

                <Separator className={s.separator} />

                {/* Блок описания */}
                <div className={s.descriptionSection}>
                  <div className={s.description}>
                    <Typography variant={'regular_14'} color={'light'}>
                      <strong>{userName}</strong> {description}
                    </Typography>
                    <Typography variant="small_text" className={s.descriptionTimestamp}>
                      {formattedCreatedAt}
                    </Typography>
                  </div>
                </div>

                <Separator className={s.separator} />

                <div className={s.comments}>
                  {comments.map((comment, index) => (
                    <div className={s.comment} key={index}>
                      <Avatar size={36} image={avatarOwner} />
                      <div>
                        <Typography variant={'regular_14'} color={'light'}>
                          <strong>UserName</strong> {comment}
                        </Typography>
                        <Typography variant="small_text" className={s.commentTimestamp}>
                          Just now
                        </Typography>
                      </div>
                      <Button variant={'text'} className={s.commentLikeButton}>
                        <HeartOutline size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator className={s.separator} />

                <div className={s.footer}>
                  <div className={s.likeSendSave}>
                    <Button variant={'text'} className={s.postButton}>
                      <HeartOutline />
                    </Button>
                    <Button variant={'text'} className={s.postButton}>
                      <PaperPlane />
                    </Button>
                    <Button variant={'text'} className={s.postButton}>
                      <BookmarkOutline />
                    </Button>
                  </div>

                  <div className={s.likesRow} style={{ textWrap: 'wrap' }}>
                    <div className={s.likesAvatars}>
                      <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
                      <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
                      <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
                    </div>
                    <div>
                      <Typography variant={'regular_14'} color={'light'}>
                        2 243 <strong>likes</strong>
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="small_text" className={s.timestamp}>
                    {formattedCreatedAt}
                  </Typography>
                  <Separator />

                  {variant !== 'public' && (
                    <form onSubmit={handleCommentSubmit(handlePublish)} className={s.inputForm}>
                      <ControlledInput<CommentForm>
                        name={'comment'}
                        control={commentControl}
                        inputType={'text'}
                        placeholder={'Add a Comment'}
                        className={s.input}
                      />
                      <Button variant={'text'} type={'submit'} disabled={!watchComment('comment')?.trim()}>
                        Publish
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}

export default PostModal
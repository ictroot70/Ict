'use client'

import { ReactElement, useMemo, useState } from 'react'

import Image from 'next/image'

import { Button, Input, Modal, Typography } from '@/shared/ui'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { UserImage } from '@/entities/users/api/api.types'

import s from './PostModal.module.scss'

type Props = {
  open: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
}

export const PostModal = ({ open, onClose, images, initialIndex = 0 }: Props): ReactElement => {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<string[]>([
    'Awesome shot! The colors are incredible.',
    'Looks like a perfect vacation spot.',
  ])

  const slides: UserImage[] = useMemo(() => {
    return images.map((url, idx) => ({
      url,
      createdAt: new Date().toISOString(),
      fileSize: 0,
      height: 0,
      uploadId: String(idx),
      width: 0,
    }))
  }, [images])

  const handlePublish = () => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    setComment('')
  }

  return (
    <Modal open={open} onClose={onClose} width={'90vw'} height={'80vh'} className={s.modal}>
      <div className={s.container}>
        <div className={s.media}>
          {images.length > 1 ? (
            <Carousel slides={slides} options={{ startIndex: initialIndex }} />
          ) : (
            <Image src={images[0]} alt={'Post image'} fill className={s.image} />
          )}
        </div>

        <div className={s.sidebar}>
          <div className={s.comments}>
            {comments.map((text, idx) => (
              <div key={idx} className={s.commentItem}>
                <Typography variant={'regular_14'}>{text}</Typography>
              </div>
            ))}
          </div>
          <div className={s.inputRow}>
            <Input
              placeholder={'Add a comment...'}
              value={comment}
              onChange={e => setComment(e.currentTarget.value)}
            />
            <Button variant={'text'} onClick={handlePublish} disabled={!comment.trim()} className={s.publishBtn}>
              <Typography variant={'regular_14'}>Publish</Typography>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default PostModal



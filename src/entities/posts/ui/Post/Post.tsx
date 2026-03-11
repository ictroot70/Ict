'use client'

import { PostViewModel } from '@/entities/posts/api'
import { useRouter } from 'next/navigation'
import { PostContent } from './PostContent/PostContent'
import { PostImages } from './PostImages/PostImages'

import { Modal } from '@ictroot/ui-kit'
import s from './Post.module.scss'

type Props = {
  post: PostViewModel
}

function Post({ post }: Props) {
  const router = useRouter()

  const handleClosePost = () => router.back()

  const { images } = post

  return (
    <Modal open={true} onClose={handleClosePost}>
      <div className={s.wrapper}>
        <PostImages images={images} />
        <PostContent post={post} />
      </div>
    </Modal>
  )
}

export { Post }

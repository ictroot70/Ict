import s from './PostImages.module.scss'

import Image from 'next/image'

import { Carousel } from '@/shared/composites'
import { UserImage } from '@/entities/users/api/api.types'

type Props = {
  images: UserImage[]
}

export const PostImages = ({ images }: Props) => {
  let content = null

  console.log(images.length)

  if (images.length > 1) {
    content = <Carousel slides={images} options={{ align: 'center', loop: false }} />
  } else if (images.length === 1) {
    content = <Image src={images[0].url} alt={'Post image'} fill className={s.image} />
  }

  return <div className={s.wrapper}>{content}</div>
}

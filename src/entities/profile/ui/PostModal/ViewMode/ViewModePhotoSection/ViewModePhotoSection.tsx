// components/PhotoSection.tsx
import Image from 'next/image'
import { PostModalData } from '@/shared/types'
import s from '../ViewMode.module.scss'
import { Carousel } from '@/shared/composites'

interface PhotoSectionProps {
  postData: PostModalData
}

export const ViewModePhotoSection: React.FC<PhotoSectionProps> = ({ postData }) => {
  return (
    <div className={s.photoContainer}>
      {postData.images.length > 1 ? (
        <Carousel slides={postData.images} options={{ align: 'center', loop: false }} />
      ) : postData.images.length === 1 ? (
        <Image
          src={postData.images[0].url}
          alt="Post image"
          fill
          sizes="width: 490px, height: 572px"
          className={s.image}
        />
      ) : null}
    </div>
  )
}

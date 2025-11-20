import Image from 'next/image'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { PostModalData } from '@/shared/types'
import s from '../EditMode.module.scss'

interface EditImageSectionProps {
  postData: PostModalData
}

export const EditModeImageSection: React.FC<EditImageSectionProps> = ({ postData }) => {
  return (
    <div className={s.editImageContainer}>
      {postData.images.length > 1 ? (
        <Carousel
          slides={postData.images}
          options={{ align: 'center', loop: false }}
        />
      ) : postData.images.length === 1 ? (
        <Image
          src={postData.images[0].url}
          alt="Post image"
          fill
          className={s.editImage}
        />
      ) : null}
    </div>
  )
}
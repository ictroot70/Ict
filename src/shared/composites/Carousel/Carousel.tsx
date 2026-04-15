import type { EmblaOptionsType } from './EmblaCarousel'

import { lazy, Suspense, type FC } from 'react'

import { UserImage } from '@/entities/users/api/api.types'
import { IMAGE_LOADING_STRATEGY, IMAGE_SIZES } from '@/shared/constant'
import { SafeImage } from '@/shared/ui'

import s from './Carousel.module.scss'

type CarouselProps = {
  slides: UserImage[] | string[]
  options?: EmblaOptionsType
  filtersState?: Record<number, string>
  onSlideChange?: (index: number) => void
  imageSizes?: string
  priorityFirstImage?: boolean
}

const EmblaCarousel = lazy(() =>
  import('./EmblaCarousel').then(module => ({
    default: module.EmblaCarousel,
  }))
)
const DEFAULT_IMAGE = '/default-image.svg'

const CarouselSingleSlide = ({
  slides,
  filtersState,
  imageSizes,
  priorityFirstImage,
}: Required<Pick<CarouselProps, 'slides' | 'imageSizes' | 'priorityFirstImage'>> &
  Pick<CarouselProps, 'filtersState'>) => {
  const singleSlide = slides[0]
  const filter = filtersState?.[0] ?? ''
  const imageLoadingStrategy = priorityFirstImage
    ? IMAGE_LOADING_STRATEGY.lcp
    : IMAGE_LOADING_STRATEGY.default

  return (
    <div className={s.carousel}>
      <div className={s.carousel__viewport}>
        <div className={s.carousel__container}>
          <div className={s.carousel__slide}>
            <div className={s.carousel__image}>
              <SafeImage
                {...imageLoadingStrategy}
                src={typeof singleSlide === 'string' ? singleSlide : singleSlide.url}
                fallbackSrc={DEFAULT_IMAGE}
                alt={'Image 1'}
                fill
                sizes={imageSizes}
                telemetryLabel={'CarouselSingleSlide'}
                className={filter ? s[filter.toLowerCase()] : ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Carousel: FC<CarouselProps> = ({
  slides,
  options,
  filtersState,
  onSlideChange,
  imageSizes = IMAGE_SIZES.PUBLIC_POST,
  priorityFirstImage = false,
}) => {
  if (slides.length === 0) {
    return null
  }

  if (slides.length === 1) {
    return (
      <CarouselSingleSlide
        slides={slides}
        filtersState={filtersState}
        imageSizes={imageSizes}
        priorityFirstImage={priorityFirstImage}
      />
    )
  }

  return (
    <Suspense
      fallback={
        <CarouselSingleSlide
          slides={slides}
          filtersState={filtersState}
          imageSizes={imageSizes}
          priorityFirstImage={priorityFirstImage}
        />
      }
    >
      <EmblaCarousel
        slides={slides}
        options={options}
        filtersState={filtersState}
        onSlideChange={onSlideChange}
        imageSizes={imageSizes}
        priorityFirstImage={priorityFirstImage}
      />
    </Suspense>
  )
}

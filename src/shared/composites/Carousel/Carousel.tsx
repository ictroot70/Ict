/** @prettier */
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import s from './Carousel.module.scss'
import { UserImage } from '@/entities/users/api/api.types'
import { ArrowBackSimple, ArrowForwardSimple } from '@/shared/ui'

type EmblaOptionsType = Parameters<typeof useEmblaCarousel>[0]

type PropType = {
  slides: UserImage[] | string[]
  options?: EmblaOptionsType
  filtersState?: Record<number, string>
  onSlideChange?: (index: number) => void
}

export const Carousel: React.FC<PropType> = props => {
  const { slides, options, filtersState, onSlideChange } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return

    const index = emblaApi.selectedScrollSnap()

    if (onSlideChange) onSlideChange(index)

    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onInit()
    onSelect()
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className={s.carousel}>
      <div className={s.carousel__viewport} ref={emblaRef}>
        <div className={s.carousel__container}>
          {slides.map((slide, index) => {
            const filter = filtersState && filtersState[index] ? filtersState[index] : ''
            return (
              <div className={s.carousel__slide} key={index}>
                <div className={s.carousel__image}>
                  <Image
                    src={typeof slide === 'string' ? slide : slide.url}
                    alt={`Image ${index + 1}`}
                    fill
                    className={filter ? s[filter.toLowerCase()] : ''}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className={s.carousel__nav}>
          <button
            className={s.carousel__button}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            type="button"
            aria-label="Previous slide"
          >
            <ArrowBackSimple />
          </button>
          <button
            className={s.carousel__button}
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            type="button"
            aria-label="Next slide"
          >
            <ArrowForwardSimple />
          </button>
        </div>
      )}

      {slides.length > 1 && (
        <div className={s.carousel__controls}>
          <div className={s.carousel__dots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${s.carousel__dot} ${index === selectedIndex ? s['carousel__dot--active'] : ''}`}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

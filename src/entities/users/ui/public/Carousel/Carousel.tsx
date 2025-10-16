/** @prettier */
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { UserImage } from '@/entities/users/api/api.types'
import s from './Carousel.module.scss'
import { ArrowBackSimple, ArrowForwardSimple } from '@/shared/ui'

type EmblaOptionsType = Parameters<typeof useEmblaCarousel>[0]

type PropType = {
  slides: UserImage[]
  options?: EmblaOptionsType
}

const Carousel: React.FC<PropType> = props => {
  const { slides, options } = props
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
    <div className={s.embla}>
      <div className={s.viewport} ref={emblaRef}>
        <div className={s.container}>
          {slides.map((slide, index) => (
            <div className={s.slide} key={index}>
              <div className={s.slideNumber}>
                <Image src={slide.url} alt={`Image ${index + 1}`} fill />
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className={s.navButtons}>
          <button
            className={s.navButton}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            type="button"
            aria-label="Previous slide"
          >
            <ArrowBackSimple />
          </button>
          <button
            className={s.navButton}
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
        <div className={s.controls}>
          <div className={s.dots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${s.dot} ${index === selectedIndex ? s.dotSelected : ''}`}
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

export default Carousel

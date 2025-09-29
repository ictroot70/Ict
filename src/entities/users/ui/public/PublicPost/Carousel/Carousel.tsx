/** @prettier */
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import Image from 'next/image'
import { UserImage } from '@/entities/users/api/api.types'
import styles from './Carousel.module.scss'
import { ArrowBackSimple, ArrowForwardSimple } from '@/shared/ui'

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

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
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
    <div className={styles.embla}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {slides.map((slide, index) => (
            <div className={styles.slide} key={index}>
              <div className={styles.slideNumber}>
                <Image src={slide.url} alt={`Image ${index + 1}`} fill />
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            type="button"
            aria-label="Previous slide"
          >
            <ArrowBackSimple />
          </button>
          <button
            className={styles.navButton}
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
        <div className={styles.controls}>
          <div className={styles.dots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === selectedIndex ? styles.dotSelected : ''}`}
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

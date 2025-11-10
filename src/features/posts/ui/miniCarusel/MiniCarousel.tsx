'use client'
import React, { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import styles from './MiniCarousel.module.scss'

interface MiniCarouselProps {
  children: React.ReactNode
  className?: string
}

export const MiniCarousel: React.FC<MiniCarouselProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const checkScroll = () => {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollPrev(scrollLeft > 0)
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1)
  }

  const scrollBy = (offset: number) => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const scrollNext = () => {
    if (!containerRef.current) return
    scrollBy(containerRef.current.clientWidth * 0.6)
  }

  const scrollPrev = () => {
    if (!containerRef.current) return
    scrollBy(-containerRef.current.clientWidth * 0.6)
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [children])

  return (
    <div className={styles.wrapper}>
      {canScrollPrev && (
        <button className={`${styles.nav} ${styles.prev}`} onClick={scrollPrev}>
          ‹
        </button>
      )}
      <div className={clsx(styles.container, className)} ref={containerRef} onScroll={checkScroll}>
        {React.Children.map(children, (child, idx) => (
          <div className={styles.slide} key={idx}>
            {child}
          </div>
        ))}
      </div>
      {canScrollNext && (
        <button className={`${styles.nav} ${styles.next}`} onClick={scrollNext}>
          ›
        </button>
      )}
    </div>
  )
}

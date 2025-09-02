import React, { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import styles from "./EmblaCarousel.module.css"

interface Props {
  photos: string[];
  filter?: string;
}

const EmblaCarousel: React.FC<Props> = ({ photos, filter }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
  }, [emblaApi])

  return (
    <div className={styles.embla}>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {photos.map((src, idx) => (
            <div className={styles.embla__slide} key={idx}>
              <img
                src={src}
                alt={`post-${idx}`}
                className={filter ? styles[filter.toLowerCase()] : ""}
              />
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button
            className={`${styles.embla__button} ${styles.embla__button__prev}`}
            onClick={scrollPrev}
          >
            ‹
          </button>
          <button
            className={`${styles.embla__button} ${styles.embla__button__next}`}
            onClick={scrollNext}
          >
            ›
          </button>

          <div className={styles.embla__dots}>
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.embla__dot} ${
                  idx === selectedIndex ? styles.embla__dot__active : ""
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EmblaCarousel

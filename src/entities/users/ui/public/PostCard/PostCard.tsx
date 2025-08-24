/** @prettier */
'use client'

import Image from 'next/image'

import { Typography } from '@ictroot/ui-kit'
import { useState } from 'react'
import s from './PostCard.module.scss'

export const PostCard = () => {
  const MAX_CHAR_COUNT = 70
  const message =
    'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laboriosam voluptatibus non,m magniLorem ipsum dolor sit, amet consectetur adipisicing  elit. Laboriosam voluptatibus non,m magniLorem ipsum dolor sit, amet consectetur adipisicing  elit. Laboriosam ывааааа ывафвыаыва ываывавыа  ывафывпывм  sdfasf'

  const [isExpanded, setIsExpanded] = useState(false)
  const isLongMessage = message.length >= MAX_CHAR_COUNT

  const toggleMessageDisplayHandler = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <div className={s.wrapper}>
      <div
        className={`${s.imageContainer} ${isExpanded ? s.imageContainerExpanded : s.imageContainerCollapsed}`}
      >
        <Image src="/images/image.png" alt="Картинка" fill className={s.image} />
      </div>
      <div className={s.user}>
        <div className={s.avatar}>
          <Image src="/images/avatar.png" alt="Картинка" fill className={s.image} />
        </div>
        <Typography variant="h3">UserName</Typography>
      </div>
      <div className={s.content}>
        <Typography className={s.data} variant="small_text">
          22 min ago
        </Typography>
        <div className={s.messageWrapper}>
          <Typography
            className={`${s.message} ${isExpanded ? s.messageExpanded : s.messageCollapsed}`}
            variant="regular_14"
          >
            {isExpanded || !isLongMessage ? message : message.slice(0, MAX_CHAR_COUNT) + '...'}
            {isLongMessage && (
              <Typography
                asChild
                onClick={toggleMessageDisplayHandler}
                variant="regular_link"
                className={s.link}
              >
                <span>{isExpanded ? 'Hide' : 'ShowMore'}</span>
              </Typography>
            )}
          </Typography>
        </div>
      </div>
    </div>
  )
}

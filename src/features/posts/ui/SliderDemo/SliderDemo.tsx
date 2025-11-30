'use client'

import * as React from 'react'

import * as SliderPrimitive from '@radix-ui/react-slider'

import styles from './SliderDemo.module.scss'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 1,
  max = 3,
  step = 0.1,
}) => {
  return (
    <SliderPrimitive.Root
      className={styles.root}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
    >
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={styles.thumb} />
    </SliderPrimitive.Root>
  )
}

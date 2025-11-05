import { useRef } from 'react'

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const getCanvas = (): HTMLCanvasElement => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas')
      canvasRef.current = canvas
    }
    return canvasRef.current
  }

  return { getCanvas }
}

'use client'
import { useState } from 'react'

import { Step, UploadedFile } from '@/features/posts/model/types'

export const useCreatePost = () => {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<UploadedFile[]>([])

  return { step, setStep, files, setFiles }
}

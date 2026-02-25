'use client'
import { Typography } from '@/shared/ui'

type Props = {
  message: string | null
}

export const ProfileBio = ({ message }: Props) => (
  <Typography variant="regular_16">{message || 'No information has been added yet.'}</Typography>
)

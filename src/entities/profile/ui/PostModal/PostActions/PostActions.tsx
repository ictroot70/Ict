import { ActionsMenu } from '@/shared/composites/ActionsMenu/ActionsMenu'
import { ActionsMenuItem } from '@/shared/composites/ActionsMenu/ActionsMenuItem/ActionsMenuItem'
import { EditOutline, TrashOutline } from '@ictroot/ui-kit'
import React from 'react'

export default function PostActions() {
  return (
    <ActionsMenu>
      <ActionsMenuItem icon={<EditOutline />}>Edit Post</ActionsMenuItem>
      <ActionsMenuItem icon={<TrashOutline />}>Delete Post</ActionsMenuItem>
    </ActionsMenu>
  )
}

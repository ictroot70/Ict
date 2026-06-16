import { PostModalData, PostVariant } from '@/shared/types'

import s from '../ViewMode.module.scss'

import { ViewModePostActions } from './ViewModePostActions/ViewModePostActions'

interface ViewModePostFooterProps {
  variant: PostVariant
  postData: Pick<PostModalData, 'likesCount' | 'avatarWhoLikes'>
  formattedCreatedAt: string
  isAuthLoading: boolean
}

export const ViewModePostFooter = ({
  variant,
  postData,
  formattedCreatedAt,
  isAuthLoading,
}: ViewModePostFooterProps) => {
  return (
    <div className={s.postFooter}>
      <ViewModePostActions
        variant={variant}
        postData={postData}
        formattedCreatedAt={formattedCreatedAt}
        isAuthLoading={isAuthLoading}
      />
    </div>
  )
}

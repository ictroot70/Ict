'use client'

import { useAuth } from '@/features/posts/utils/useAuth'
import s from './PostContentFooter.module.scss'
import {
  BookmarkOutline,
  Button,
  HeartOutline,
  PaperPlane,
  Separator,
  Typography,
} from '@ictroot/ui-kit'
import { formattedCreatedAt } from '../../helpers/formattedCreatedAt'
import { ControlledInput } from '@/features/formControls'

type Props = {
  createdAt: string
  likesCount: number
}

export const PostContentFooter = ({ createdAt, likesCount }: Props) => {
  const { isAuthenticated } = useAuth()

  return (
    <div className={s.wrapper}>
      {isAuthenticated && (
        <div className={s.likeSendSave}>
          <Button variant={'text'} className={s.postButton}>
            <HeartOutline color={'white'} />
          </Button>
          <Button variant={'text'} className={s.postButton}>
            <PaperPlane color={'white'} />
          </Button>
          <Button variant={'text'} className={s.postButton}>
            <BookmarkOutline color={'white'} />
          </Button>
        </div>
      )}

      <div className={s.likes}>
        <div className={s.avatars}>
          <div className={`${s.avatar} ${s.avatar_1}`} />
          <div className={`${s.avatar} ${s.avatar_2}`} />
          <div className={`${s.avatar} ${s.avatar_3}`} />
        </div>
        <Typography variant={'regular_14'} color={'light'} className={s.counter}>
          <span>{likesCount}</span>
          <b>"Likes"</b>
        </Typography>
      </div>

      <Typography variant={'small_text'} className={s.timestamp}>
        {formattedCreatedAt(createdAt)}
      </Typography>

      {isAuthenticated && (
        <>
          <Separator className={s.separator} />

          <form onSubmit={() => {}} className={s.inputForm}>
            <ControlledInput
              name={'comment'}
              inputType={'text'}
              placeholder={'Add a Comment'}
              className={s.input}
            />
            <Button variant={'text'} type={'submit'} disabled={true}>
              Publish
            </Button>
          </form>
        </>
      )}
    </div>
  )
}

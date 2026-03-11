import { Comment } from './Comment/Comment'
import s from './PostContentMain.module.scss'

type Props = {
  avatar: string
  userName: string
  description: string
}
export const PostContentMain = ({ avatar, userName, description }: Props) => {
  return (
    <div className={s.wrapper}>
      <Comment avatar={avatar} name={userName} message={description} />
      <Comment avatar={avatar} name={userName} message={'Hello'} />
      <Comment avatar={avatar} name={userName} message={'Hello my friend'} />
      <Comment avatar={avatar} name={userName} message={'Hello my friend'} />
      <Comment avatar={avatar} name={userName} message={'Hello my friend'} />
      {/* TODO: Other comments */}
    </div>
  )
}

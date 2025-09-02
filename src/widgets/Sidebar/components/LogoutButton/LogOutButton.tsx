import { Button, LogOut } from '@/shared/ui'
import s from './LogOutButton.module.scss'

export const LogOutButton = () => {
  return (
    <Button as="button" variant="text" className={s.button}>
      <LogOut />
      <span>Log Out</span>
    </Button>
  )
}

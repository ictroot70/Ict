import { ReactNode } from 'react'
import s from './ActionsMenuItem.module.scss'
import { Button, Typography } from '@/shared/ui'

type Props = {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
}

export const ActionsMenuItem: React.FC<Props> = ({ children, onClick, icon }) => {
  return (
    <Button variant="text" className={s.button} onClick={onClick} aria-label="Edit Post">
      {icon}
      <Typography variant="regular_14" className={s.text}>
        {children}
      </Typography>
    </Button>
  )
}
